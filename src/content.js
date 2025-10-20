let currentScollPosition = 0;

const pagesToScroll = ["/", "/results"];
const userProfile = /^\/@[a-zA-Z0-9]/;

let userProfileCategory = null;
let selectedCategoryChip = null;
const shouldPageScroll = () =>
  pagesToScroll.includes(location.pathname) ||
  userProfile.test(location.pathname);

document.addEventListener("scroll", () => {
  if (shouldPageScroll()) {
    currentScollPosition = window.scrollY;
  }
});

navigation.addEventListener("navigatesuccess", () => {
  if (shouldPageScroll()) {
    document.documentElement.scrollTo({
      top: currentScollPosition,
      behavior: "smooth",
    });
  }

  if (userProfile.test(location.pathname)) {
    const chips = document.querySelectorAll("yt-chip-cloud-chip-renderer");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        selectedCategoryChip = chip;
      });
    });
  }

  if (userProfile.test(location.pathname)) {
    if (selectedCategoryChip) {
      selectedCategoryChip.click();
    }
  }
});
