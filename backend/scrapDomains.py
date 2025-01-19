from bs4 import BeautifulSoup

def extract_domains_from_file(file_path, output_file):
    """Extracts domains from a saved HTML file and saves them to a file."""
    try:
        # Read the HTML file
        with open(file_path, "r", encoding="utf-8") as file:
            html_content = file.read()

        # Parse the HTML content
        soup = BeautifulSoup(html_content, "html.parser")

        # Find the table rows containing the domains
        rows = soup.select("table.chakra-table tr.css-1whkjwr")

        # Extract domains (first <td> in each row)
        domains = []
        for row in rows:
            domain_cell = row.select_one("td.css-osmp5g")
            if domain_cell:
                domains.append(domain_cell.text.strip())

        # Save domains to a file
        with open(output_file, "w", encoding="utf-8") as out_file:
            out_file.write("\n".join(domains))

        print(f"Extracted {len(domains)} domains. Saved to {output_file}")
        return domains

    except Exception as e:
        print(f"Error extracting domains: {e}")
        return []

# Path to the downloaded HTML file
html_file_path = "breachDirectory.html"  # Replace with your actual file name
output_file_path = "extracted_domains.txt"  # File to save extracted domains

# Extract domains and save them to the output file
extracted_domains = extract_domains_from_file(html_file_path, output_file_path)

# Print a message to confirm saving
print(f"Domains saved in: {output_file_path}")
