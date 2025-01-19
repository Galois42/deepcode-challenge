import re
import csv
import requests
import socket
from urllib.parse import urlparse, unquote
from requests.exceptions import RequestException
from concurrent.futures import ThreadPoolExecutor
import asyncio
from functools import lru_cache
# Add at the top of your script
import urllib3
import mysql.connector
from mysql.connector import Error
import json
import aiohttp
from concurrent.futures import ProcessPoolExecutor
from functools import partial
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


# Load OWASP patterns dynamically from a file or source
import builtins

# Save the original print function


# Override the print function to do nothing


def load_breached_domains(file_path):
    """Load breached domains from a file."""
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return set(line.strip() for line in file if line.strip())
    except FileNotFoundError:
        return set()


import json

import json
from functools import lru_cache

@lru_cache(maxsize=None)
def load_owasp_patterns_from_json(file_path="web_app_patterns.json"):
    """Load application patterns dynamically from a JSON file."""
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data.get("patterns", {})
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


# Load application-specific patterns
UNIQUE_APP_PATTERNS = load_owasp_patterns_from_json("web_app_patterns.json")

# Utility Functions
# Precompile regex patterns for efficiency
SCHEME_PATTERN = re.compile(r'^(http|https|android|mqtt|coap)://')
IP_ADDRESS_PATTERN = re.compile(r'^\d{1,3}(\.\d{1,3}){3}$')

@lru_cache(maxsize=10000)
def is_valid_url(uri):
    """Validates URL structure and returns the parsed URL."""
    if not SCHEME_PATTERN.match(uri) or len(uri) < 10:
        return None
    try:
        parsed = urlparse(uri)
        if parsed.netloc and not any(c in parsed.netloc for c in '<>"') and (
            IP_ADDRESS_PATTERN.match(parsed.hostname or "") or any(c.isalpha() for c in parsed.hostname or "")
        ):
            return parsed
    except Exception:
        pass
    return None



# def parse_android_line(line):
#     """Parses Android-specific lines."""
#     try:
#         uri, username, password = parse_credentials(line)  # Updated to use the new logic
#         parsed = is_valid_url(uri)
#         if not parsed:
#             return None
#         domain = parsed.hostname or ""
#         ip_address = domain if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain) else None
#         tags = assign_tags(domain, ip_address, None, "android", True)

#         return {
#             "uri": uri,
#             "username": username,
#             "password": password,
#             "domain": domain,
#             "ip_address": ip_address,
#             "port": None,
#             "path": parsed.path,
#             "tags": tags,
#         }
#     except Exception as e:
#         print(f"Error parsing Android line: {line}. Error: {e}")
#         return None
def resolve_ip_address(domain):
    """Resolve the IP address for a given domain."""
    try:
        ip_address = socket.gethostbyname(domain)
        return ip_address
    except (socket.gaierror, socket.timeout):
        return None


async def parse_standard_line_async(line, breached_domains, session):
    """Parses a line with async HTTP requests."""
    try:
        uri, username, password = parse_credentials(line)
        if not uri or username.strip("*") == "" or password.strip("*") == "":
            return None

        parsed = is_valid_url(uri)
        if not parsed:
            return None

        domain = parsed.hostname or ""
        ip_address = resolve_ip_address(domain)  # Resolve the IP address
        path = parsed.path
        scheme = parsed.scheme
        port = parsed.port or (443 if scheme == "https" else 80)

        domain = unquote(domain)
        path = unquote(path)

        is_resolved = check_domain_resolution(domain)
        web_app = detect_application_from_url(uri, path)

        # Initialize flags
        is_accessible = False
        is_parked = False
        has_login_form = False
        login_form_type = None
        title = None

        if scheme in ["http", "https"]:
            try:
                async with session.get(uri, timeout=0.2) as response:
                    is_accessible = response.status == 200
                    if is_accessible:
                        content = await response.text()

                        # Extract title from HTML
                        title_match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
                        if title_match:
                            title = title_match.group(1).strip()

                        # Check for login form
                        if "password" in content or "login" in content:
                            has_login_form = True
                            if "captcha" in content:
                                login_form_type = "captcha"
                            elif "otp" in content:
                                login_form_type = "otp"
                            else:
                                login_form_type = "basic"

                        # Check if the domain is parked
                        is_parked = "domain is parked" in content.lower() or "buy this domain" in content.lower()

            except Exception:
                pass

        # Assign structured tags
        tags = assign_tags(domain, ip_address, scheme, is_resolved, is_accessible, is_parked, has_login_form)
        if domain in breached_domains:
            tags["breach_status"] = "breached"

        result = {
            "uri": uri,
            "username": username,
            "password": password,
            "domain": domain,
            "ip_address": ip_address,  # Save the resolved IP address
            "port": port,
            "path": path,
            "tags": tags,
            "title": title,
            "is_resolved": is_resolved,
            "is_accessible": is_accessible,
            "has_login_form": has_login_form,
            "login_form_type": login_form_type,
            "web_application": web_app,
            "is_parked": is_parked,
        }

        return result
    except Exception:
        return None


def parse_credentials(line):
    """Extracts URL, username, and password efficiently using the last two ':' delimiters."""
    try:
        # Find last colon position
        last_colon = line.rindex(":")
        if last_colon == -1:
            return None
            
        # Find second-to-last colon position
        second_last_colon = line.rindex(":", 0, last_colon)
        if second_last_colon == -1:
            return None
            
        # Extract components
        uri = line[:second_last_colon].strip()
        username = line[second_last_colon + 1:last_colon].strip()
        password = line[last_colon + 1:].strip()

        # Ensure the URI has a scheme
        if not re.match(SCHEME_PATTERN, uri):
            uri = f"http://{uri}"  # Default to HTTP if no scheme is present

        return uri, username, password
    except ValueError:
        # If any index operation fails, the line is malformed
        return None


# def assign_tags(domain, ip_address, port, scheme, is_resolved):
#     """Assigns tags based on IP, scheme, and resolution status."""
#     tags = []
#     if ip_address:
#         if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip_address):
#             tags.append("ipv4")
#         elif re.match(r"^\[.*\]$", ip_address):
#             tags.append("ipv6")
#         if re.match(r"^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1]))", ip_address):
#             tags.append("local-ip")
#         else:
#             tags.append("public-ip")
#     if port:
#         tags.append(f"port-{port}")
#     if scheme == "https":
#         tags.append("ssl-secured")
#     elif scheme == "android":
#         tags.append("android-specific")
#     elif scheme in ["ftp", "sftp", "ws", "wss", "mqtt", "coap"]:
#         tags.append(f"{scheme}-specific")
#     else:
#         tags.append("non-secured")
#     if is_resolved:
#         tags.append("resolved")
#     else:
#         tags.append("unresolved")
#     return tags

def assign_tags(domain, ip_address, scheme, is_resolved, is_accessible, is_parked, has_login_form):
    """Assigns tags as key-value pairs for structured output."""
    tags = {}

    # IP type and scope
    if ip_address:
        if ip_address.count('.') == 3:
            tags["ip_type"] = "ipv4"
        elif ip_address.startswith("[") and ip_address.endswith("]"):
            tags["ip_type"] = "ipv6"

        if ip_address.startswith(("127.", "10.", "192.168.", "172.")):
            tags["scope"] = "local"
        else:
            tags["scope"] = "public"

    # Protocol type
    tags["protocol"] = scheme

    # Domain resolution status
    tags["resolution_status"] = "resolved" if is_resolved else "unresolved"

    # Status
    tags["status"] = "active" if is_accessible else "inactive"

    # Environment
    if is_parked:
        tags["env"] = "staging"
    elif is_resolved and is_accessible:
        tags["env"] = "production"
    else:
        tags["env"] = "dev"

    # Priority (Dynamic calculation based on metrics)
    tags["priority"] = calculate_priority(is_resolved, is_accessible, is_parked, has_login_form)

    # Check if the traffic is Android-specific
    if scheme == "android":
        tags["android_traffic"] = True
    else:
        tags["android_traffic"] = False

    return tags

def calculate_priority(is_resolved, is_accessible, is_parked, has_login_form):
    """
    Dynamically calculates the priority based on input metrics.
    Returns: "critical", "high", "medium", "low".
    """
    score = 0

    # Scoring weights
    if is_resolved:
        score += 3
    if is_accessible:
        score += 4
    if has_login_form:
        score += 2
    if is_parked:
        score -= 3  # Decrease score for parked domains

    # Determine priority based on score
    if score >= 7:
        return "critical"
    elif 5 <= score < 7:
        return "high"
    elif 3 <= score < 5:
        return "medium"
    else:
        return "low"



# Application Detection
def detect_application_from_url(uri, path):
    """Detects application type based on URL patterns."""
    for pattern, app in UNIQUE_APP_PATTERNS.items():
        if pattern in uri.lower() or pattern in path.lower():
            #print(f"Pattern matched in URL or path: {pattern}, Application detected: {app}")
            return app
    #print(f"No URL pattern matched for URI: {uri}, Path: {path}")
    return None


def detect_application_from_response(uri, path, response):
    """Enhances application detection using response content."""
    # First, try to detect from URL patterns
    

    if response:
        # Check title patterns for additional matches
        title_patterns = {
            "WordPress": ["wordpress"],
            "Joomla": ["joomla"],
            "Drupal": ["drupal"],
            "phpMyAdmin": ["phpmyadmin"],
            "Zimbra": ["zimbra"],
            "Atlassian Jira": ["jira"],
            "Magento": ["magento"],
        }
        for app_name, keywords in title_patterns.items():
            if any(keyword in response.text.lower() for keyword in keywords):
                #print(f"Title pattern matched for {app_name}")
                return app_name

        # Check for generator meta tag patterns
        meta_patterns = {
            "WordPress": ["generator\" content=\"wordpress"],
            "Joomla": ["generator\" content=\"joomla"],
            "Drupal": ["generator\" content=\"drupal"],
        }
        for app_name, keywords in meta_patterns.items():
            if any(keyword in response.text.lower() for keyword in keywords):
                #print(f"Meta tag pattern matched for {app_name}")
                return app_name

    #print(f"No application detected from response for URI: {uri}, Path: {path}")
    return None



# Content and Login Detection
def check_login_form(response):
    """Checks if a login form is present in the response body."""
    if not response:
        return False, None
    login_form_keywords = ["password", "login", "username", "email"]
    captcha_keywords = ["captcha"]
    otp_keywords = ["otp", "one-time password"]
    is_login_form = any(keyword in response.text.lower() for keyword in login_form_keywords)
    is_captcha = any(keyword in response.text.lower() for keyword in captcha_keywords)
    is_otp = any(keyword in response.text.lower() for keyword in otp_keywords)
    if is_login_form:
        if is_captcha:
            return True, "captcha"
        elif is_otp:
            return True, "otp"
        else:
            return True, "basic"
    return False, None

# Domain and URL Validation
from functools import lru_cache

# Precompile patterns
IP_PATTERN = re.compile(r'^\d{1,3}(\.\d{1,3}){3}$')
PRIVATE_IP_PATTERN = re.compile(r'^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)')

resolved_domains_cache = {}

def check_domain_resolution(domain):
    """Checks if the domain resolves to an IP address."""
    if domain in resolved_domains_cache:
        return resolved_domains_cache[domain]
    try:
        socket.setdefaulttimeout(0.2)
        socket.gethostbyname(domain)
        resolved_domains_cache[domain] = True
        return True
    except (socket.gaierror, socket.timeout):
        resolved_domains_cache[domain] = False
        return False
    finally:
        socket.setdefaulttimeout(None)


def check_breach_and_ransom(domain, breached_domains):
    """Checks if the domain is part of a breach."""
    is_breached = domain in breached_domains
    return is_breached

# Asynchronous URL Validation and Content Extraction
import aiohttp
# Constants for async processing
MAX_CONCURRENT_REQUESTS = 100
REQUEST_TIMEOUT = 0.2
MAX_RETRIES = 2

async def fetch_url(session, url, timeout=REQUEST_TIMEOUT):
    """Fetches the content of a URL asynchronously with optimized error handling."""
    try:
        # Use TCPConnector with optimized settings
        connector = aiohttp.TCPConnector(
            limit_per_host=10,
            ttl_dns_cache=300,  # Cache DNS results for 5 minutes
            force_close=True    # Prevent connection pooling issues
        )
        
        async with session.get(
            url,
            timeout=timeout,
            allow_redirects=False,  # Don't follow redirects
            verify_ssl=False,       # Skip SSL verification for speed
            connector=connector
        ) as response:
            if response.status == 200:
                return await response.text(encoding='utf-8', errors='ignore')
            return None
            
    except asyncio.TimeoutError:
        return None
    except Exception:
        return None

async def process_urls_async(urls, chunk_size=50):
    """Processes a list of URLs asynchronously with optimized batching."""
    results = []
    
    # Process URLs in chunks to prevent memory issues
    for i in range(0, len(urls), chunk_size):
        chunk = urls[i:i + chunk_size]
        
        # Create a ClientSession with optimized settings
        timeout = aiohttp.ClientTimeout(
            total=REQUEST_TIMEOUT * 2,
            connect=REQUEST_TIMEOUT,
            sock_read=REQUEST_TIMEOUT
        )
        
        connector = aiohttp.TCPConnector(
            limit=MAX_CONCURRENT_REQUESTS,
            ttl_dns_cache=300,
            force_close=True
        )
        
        async with aiohttp.ClientSession(
            timeout=timeout,
            connector=connector,
            headers={'User-Agent': 'Mozilla/5.0'},
            raise_for_status=False
        ) as session:
            # Create tasks for the chunk
            tasks = [fetch_url(session, url) for url in chunk]
            
            # Process chunk with gather
            chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
            results.extend(chunk_results)
            
            # Small delay between chunks to prevent overwhelming
            await asyncio.sleep(0.1)
    
    return results

async def validate_urls(urls):
    """Validates a list of URLs asynchronously with optimized checking."""
    async def check_single_url(session, url):
        try:
            async with session.head(
                url,
                allow_redirects=False,
                verify_ssl=False,
                timeout=REQUEST_TIMEOUT
            ) as response:
                return response.status < 400
        except Exception:
            return False

    timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT * 2)
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT_REQUESTS, force_close=True)
    
    async with aiohttp.ClientSession(
        timeout=timeout,
        connector=connector,
        headers={'User-Agent': 'Mozilla/5.0'}
    ) as session:
        tasks = [check_single_url(session, url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

# Helper function for running async functions from sync code
def run_async_check(urls):
    """Helper function to run async validation from synchronous code."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(validate_urls(urls))
    finally:
        loop.close()

# Parsing Function
def parse_line(line):
    """Parses a single line and extracts structured data."""
    try:
        # Pre-validate the URL for invalid '@' usage
        parsed = is_valid_url(line)

        # Extract credentials
        uri, username, password = parse_credentials(line)

        # Parse the URI
        domain = parsed.hostname or ""
        ip_address = domain if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain) else None
        port = parsed.port if parsed.port else (443 if parsed.scheme == "https" else 80 if parsed.scheme == "http" else None)
        path = parsed.path
        scheme = parsed.scheme

        # Decode URI components
        domain = unquote(domain)
        path = unquote(path)

        # Check if the domain resolves
        is_resolved = check_domain_resolution(domain)

        # Assign tags
        tags = assign_tags(domain, ip_address, port, scheme, is_resolved)

        return {
            "uri": uri,
            "username": username,
            "password": password,
            "domain": domain,
            "ip_address": ip_address,
            "port": port,
            "path": path,
            "tags": tags,
        }
    except Exception as e:
        #print(f"Error parsing line: {line}. Error: {e}")
        return None



   
#  results = []
#     for line in batch:
#         if line.startswith("android://"):
#             results.append(parse_android_line(line))
#         else:
#             results.append(parse_standard_line(line))
#     return results


def load_data_lines(file_path, max_lines=None):
    """
    Load data lines (URLs with credentials) from a file.

    Args:
        file_path (str): Path to the file containing data lines.
        max_lines (int, optional): Maximum number of lines to load. If None, load all lines.

    Returns:
        list: Loaded lines from the file.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            if max_lines:
                data_lines = [line.strip() for _, line in zip(range(max_lines), file) if line.strip()]
            else:
                data_lines = [line.strip() for line in file if line.strip()]
        #print(f"Loaded {len(data_lines)} lines from {file_path}.")
        return data_lines
    except FileNotFoundError:
        #print(f"Data lines file not found: {file_path}.")
        return []



from concurrent.futures import ProcessPoolExecutor
import asyncio
import aiohttp

async def process_single_batch(batch, breached_domains):
    """Processes a single batch of lines asynchronously."""
    async with aiohttp.ClientSession() as session:
        tasks = [parse_standard_line_async(line, breached_domains, session) for line in batch]
        results = await asyncio.gather(*tasks)
        return [result for result in results if result]

def process_batch(batch, breached_domains):
    """Helper to run async batch processing."""
    return asyncio.run(process_single_batch(batch, breached_domains))


from functools import partial  # Allows passing extra arguments to map functions

def process_lines(data_lines, breached_domains, batch_size=1000, max_processes=4):
    """Process data lines using multiprocessing for batch distribution."""
    csv_file = "breach_data_full.csv"
    csv_headers = [
        "uri", "username", "password", "domain", "ip_address", "port", "path", "tags",
        "title", "is_resolved", "is_accessible", "has_login_form", "login_form_type",
        "web_application", "is_parked"
    ]

    with ProcessPoolExecutor(max_workers=max_processes) as executor, \
         open(csv_file, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=csv_headers)
        writer.writeheader()

        # Divide data into batches
        batches = [data_lines[i:i + batch_size] for i in range(0, len(data_lines), batch_size)]

        # Map each batch to `process_batch` using multiprocessing
        for batch_results in executor.map(partial(process_batch, breached_domains=breached_domains), batches):
            for row in batch_results:
                if row:
                    # Serialize tags as JSON for output
                    row["tags"] = json.dumps(row["tags"])
                    writer.writerow(row)

    print(f"Parsed data written to {csv_file}")




def connect_to_database():
    """Establishes a connection to the MySQL database."""
    try:
        connection = mysql.connector.connect(
            host="deep-code-challenge.cj62emkiif26.us-east-2.rds.amazonaws.com",  # Replace with your database host
            user="admin",       # Replace with your database username
            password="hamidlmath",  # Replace with your database password
            database="DEEPCODE"  # Replace with your database name
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None


def insert_into_database(connection, data):
    """Inserts a single record into the MySQL database."""
    try:
        cursor = connection.cursor()

        sql = """
        INSERT INTO breaches (
            uri, username, password, domain, ip_address, port, path, tags,
            title, is_resolved, is_accessible, has_login_form, login_form_type,
            web_application, is_parked, is_breached
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """

        cursor.execute(sql, (
            data["uri"],
            data["username"],
            data["password"],
            data["domain"],
            data["ip_address"],
            data["port"],
            data["path"],
            json.dumps(data["tags"]),
            data["title"],
            data["is_resolved"],
            data["is_accessible"],
            data["has_login_form"],
            data["login_form_type"],
            data["web_application"],
            data["is_parked"],
            data["tags"].get("breach_status") == "breached"
        ))

        connection.commit()
    except Error as e:
        print(f"Error inserting into database: {e}")


def process_lines_to_database(data_lines, breached_domains, batch_size=1000, max_processes=4):
    """Processes lines and inserts results into the database."""
    connection = connect_to_database()
    if not connection:
        print("Failed to connect to the database.")
        return

    with ProcessPoolExecutor(max_workers=max_processes) as executor:
        # Divide data into batches
        batches = [data_lines[i:i + batch_size] for i in range(0, len(data_lines), batch_size)]

        # Map each batch to `process_batch`
        for batch_results in executor.map(partial(process_batch, breached_domains=breached_domains), batches):
            for row in batch_results:
                if row:
                    insert_into_database(connection, row)

    connection.close()

# Load breached domains from file
if __name__ == "__main__":
    breached_domains_file = "extracted_domains.txt"
    data_lines_file = "sample.txt"

    # Load breached domains and data lines
    breached_domains = load_breached_domains(breached_domains_file)
    data_lines = load_data_lines(data_lines_file, max_lines=25000000)

    # Process lines and insert into database
    process_lines_to_database(data_lines, breached_domains)