function getProblemStatement() {
  const problemElement = document.querySelector(".content__u3I1, .elfjS");
  console.log(problemElement);
  return problemElement ? problemElement.innerText : "Problem not found";
}

chrome.runtime.sendMessage({
  type: "PROBLEM_STATEMENT",
  data: getProblemStatement(),
});
