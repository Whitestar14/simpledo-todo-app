// I dont exactly know why Im spending more braincells than originally allocated for a project I planned on shipping in only two days but... Thi is my project. I get to decide.

// The good old convention

document.body.onload = () => {
  const root = document.documentElement,
    container = document.querySelector(".theme-icon"),
    token = window.localStorage.getItem("token") || "dark";

  const icon = container.childNodes[0];
  root.dataset.theme = token;

  // Initially instantiate the themes and icons onload.
  if (root) {
    if (token === "light") {
      toggleLight();
    } else {
      toggleDark();
    }
  }

  // Separate concerns in each function. I figured out that I could also just move the `localStorage` caller in these functions too!
  function toggleLight() {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
    window.localStorage.setItem("token", "light");
  }

  function toggleDark() {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
    window.localStorage.setItem("token", "dark");
  }

  // The event listener for the icon. (I want a larger clickable area, thus the container was used)
  container.onclick = () => {
    if (root.dataset.theme === "light") {
      root.dataset.theme = "dark";
      toggleDark();
    } else {
      root.dataset.theme = "light";
      toggleLight();
    }
  };
};
