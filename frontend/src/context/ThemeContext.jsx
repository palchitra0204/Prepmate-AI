import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const getSavedTheme = () => {
  const savedTheme = localStorage.getItem("prepmate-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  // The selected PrepMate landing design uses the light theme.
  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getSavedTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    document.body.setAttribute("data-theme", theme);

    localStorage.setItem("prepmate-theme", theme);
  }, [theme]);

  const changeTheme = (selectedTheme) => {
    if (selectedTheme !== "dark" && selectedTheme !== "light") {
      return;
    }

    setTheme(selectedTheme);
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      changeTheme,
      toggleTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};

export default ThemeContext;
