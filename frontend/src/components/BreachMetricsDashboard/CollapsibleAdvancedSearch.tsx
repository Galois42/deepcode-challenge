import { useState } from "react";
import CollapsibleSearchSection from "./CollapsibleSearchSection";
import AdvancedSearch from "./AdvancedSearch/AdvancedSearch";

const CollapsibleAdvancedSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CollapsibleSearchSection
      title="Advanced Search"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <AdvancedSearch />
    </CollapsibleSearchSection>
  );
};

export default CollapsibleAdvancedSearch;
