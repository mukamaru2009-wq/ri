/* ==========================================================================
   イヤホン診断 - quiz.html の進行ロジック
   ========================================================================== */

(function () {
  const progressFill = document.getElementById("progressFill");
  const progressLabel = document.getElementById("progressLabel");
  const questionText = document.getElementById("questionText");
  const choiceList = document.getElementById("choiceList");
  const backBtn = document.getElementById("backBtn");
  const quizCard = document.getElementById("quizCard");

  const total = QUESTIONS.length;
  let currentIndex = 0;
  const answers = new Array(total).fill(null);

  function render() {
    const question = QUESTIONS[currentIndex];

    progressFill.style.width = `${(currentIndex / total) * 100}%`;
    progressLabel.textContent = `質問 ${currentIndex + 1} / ${total}`;
    questionText.textContent = question.text;

    choiceList.innerHTML = "";
    question.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      if (answers[currentIndex] === choice.value) {
        btn.classList.add("is-selected");
      }

      const marker = document.createElement("span");
      marker.className = "choice-marker";
      const label = document.createElement("span");
      label.textContent = choice.label;

      btn.appendChild(marker);
      btn.appendChild(label);
      btn.addEventListener("click", () => selectChoice(choice.value));
      choiceList.appendChild(btn);
    });

    backBtn.disabled = currentIndex === 0;

    quizCard.classList.remove("quiz-card");
    void quizCard.offsetWidth;
    quizCard.classList.add("quiz-card");
  }

  function selectChoice(value) {
    answers[currentIndex] = value;
    render();

    setTimeout(() => {
      if (currentIndex < total - 1) {
        currentIndex += 1;
        render();
      } else {
        finish();
      }
    }, 320);
  }

  function finish() {
    sessionStorage.setItem("quizAnswers", JSON.stringify(answers));
    window.location.href = "result.html";
  }

  backBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      render();
    }
  });

  render();
})();
