function initSite() {
  const gitTest = document.querySelector(".git-test");
  if (!gitTest) return;

  gitTest.addEventListener("click", () => {
    gitTest.classList.toggle("is-moved");
  });
}

document.addEventListener("DOMContentLoaded", initSite);
