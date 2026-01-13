import React, { useState } from "react";
import styles from "./SearchBar.module.css";

import {
  FaSearch,
  FaTimes,
  FaMapMarkerAlt,
  FaChessRook,
  FaLandmark,
  FaArchway,
  FaPlaceOfWorship,
  FaStar,
} from "react-icons/fa";

import { GiStoneBust } from "react-icons/gi";

const SearchBar = ({
  monuments,
  onSelectResult,
  hasBanner,
  language = "tr",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const getCategoryStyle = (cat) => {
    const category = cat ? cat.toLowerCase() : "landmark";

    const isTr = language === "tr";
    const isHu = language === "hu";

    switch (category) {
      case "statue":
      case "monument":
        return {
          icon: <GiStoneBust />,
          color: "#D4AF37",
          label: isTr ? "Heykel" : isHu ? "Szobor" : "Statue",
        };
      case "castle":
        return {
          icon: <FaChessRook />,
          color: "#E63946",
          label: isTr ? "Kale" : isHu ? "Vár" : "Castle",
        };
      case "museum":
        return {
          icon: <FaLandmark />,
          color: "#7209B7",
          label: isTr ? "Müze" : isHu ? "Múzeum" : "Museum",
        };
      case "church":
      case "religious":
        return {
          icon: <FaPlaceOfWorship />,
          color: "#2A9D8F",
          label: isTr ? "İbadethane" : isHu ? "Templom" : "Religious",
        };
      case "bridge":
        return {
          icon: <FaArchway />,
          color: "#4361EE",
          label: isTr ? "Köprü" : isHu ? "Híd" : "Bridge",
        };
      default:
        return {
          icon: <FaStar />,
          color: "#457B9D",
          label: isTr ? "Turistik" : isHu ? "Látnivaló" : "Landmark",
        };
    }
  };

  const handleSearch = (e) => {
    const text = e.target.value;
    setQuery(text);

    if (text.length > 1) {
      const searchLower = text.toLocaleLowerCase(
        language === "tr" ? "tr" : "en"
      );

      const filtered = monuments.filter(
        (m) =>
          m.name_tr?.toLocaleLowerCase("tr").includes(searchLower) ||
          m.name_en?.toLowerCase().includes(searchLower) ||
          m.name_hu?.toLowerCase().includes(searchLower)
      );

      setResults(filtered.slice(0, 10));
      setIsActive(true);
    } else {
      setResults([]);
      setIsActive(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsActive(false);
  };

  const containerClass = `
    ${styles.searchContainer} 
    ${hasBanner ? styles.withBanner : styles.noBanner}
  `;

  const getDisplayName = (item) => {
    if (language === "tr") return item.name_tr;
    if (language === "hu") return item.name_hu;
    return item.name_en;
  };

  const getPlaceholder = () => {
    if (language === "tr") return "Budapeşte'de ara...";
    if (language === "hu") return "Keresés Budapesten...";
    return "Search in Budapest...";
  };

  return (
    <div className={containerClass}>
      <div className={styles.inputWrapper}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder={getPlaceholder()}
          className={styles.searchInput}
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length > 1 && setIsActive(true)}
        />
        {query && (
          <button
            onClick={clearSearch}
            className={styles.clearButton}
            type="button"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#333333"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {isActive && results.length > 0 && (
        <div className={styles.resultsList}>
          {results.map((item) => {
            const style = getCategoryStyle(item.category);
            return (
              <div
                key={item.id}
                className={styles.resultItem}
                onClick={() => {
                  onSelectResult(item);
                  setIsActive(false);
                  setQuery(getDisplayName(item));
                }}
              >
                <div
                  className={styles.iconBox}
                  style={{ backgroundColor: style.color }}
                >
                  {style.icon}
                </div>

                <div className={styles.resultText}>
                  <div className={styles.resultName}>
                    {getDisplayName(item)}
                  </div>

                  <div
                    className={styles.resultSub}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <span style={{ whiteSpace: "nowrap" }}>{style.label}</span>

                    {item.address && (
                      <>
                        <span style={{ margin: "0 6px", color: "#ccc" }}>
                          |
                        </span>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#888",
                            flex: 1,
                          }}
                        >
                          {item.address}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
