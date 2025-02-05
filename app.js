// === Timer Pomodoro ===
const start = document.getElementById("start");
const stop1 = document.getElementById("stop");
const reset = document.getElementById("reset");
const timer = document.getElementById("timer");
const progressBar = document.getElementById("timer-progress-bar");

let timeLeft = 1500; // 25 minutes
let interval = null;
let isBreak = false; // Pause ou travail
const workTime = 1500; // 25 minutes
const breakTime = 300; // 5 minutes

// 🔹 Mise à jour de l'affichage du timer et de la barre de progression
const updateTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.innerHTML = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    const totalTime = isBreak ? breakTime : workTime;
    const progress = (timeLeft / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.style.background = isBreak ? "#FFA500" : "#56e60e"; // Couleur pause ou travail
};

// 🔹 Activation/Désactivation des boutons
const toggleButtons = (isRunning) => {
    start.disabled = isRunning;
    stop1.disabled = !isRunning;
};

// 🔹 Démarrage du timer
const startTimer = () => {
    if (!interval) {
        toggleButtons(true);
        interval = setInterval(() => {
            timeLeft--;
            updateTimer();

            if (timeLeft === 0) {
                clearInterval(interval);
                interval = null;

                isBreak = !isBreak;
                timeLeft = isBreak ? breakTime : workTime;

                updateTimer();
                startTimer();
            }
        }, 1000);
    }
};

// 🔹 Pause du timer
const stopTimer = () => {
    clearInterval(interval);
    interval = null;
    toggleButtons(false);
};

// 🔹 Réinitialisation du timer
const resetTimer = () => {
    clearInterval(interval);
    interval = null;
    timeLeft = workTime;
    isBreak = false;
    updateTimer();
    toggleButtons(false);
};

// Initialisation
toggleButtons(false);
updateTimer();

start.addEventListener("click", startTimer);
stop1.addEventListener("click", stopTimer);
reset.addEventListener("click", resetTimer);

// === Gestion des tâches et sous-tâches ===
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const trashList = document.getElementById("trash-list");

// 🔹 Mise à jour de la progression
const updateProgress = (container, progressBar, mainCheckbox) => {
    const subtasks = container.querySelectorAll(".subtask input[type='checkbox']");
    const completedSubtasks = container.querySelectorAll(".subtask input:checked");

    if (subtasks.length > 0) {
        const progress = (completedSubtasks.length / subtasks.length) * 100;
        progressBar.style.width = `${progress}%`;
        mainCheckbox.checked = completedSubtasks.length === subtasks.length;

        // Si toutes les sous-tâches sont cochées, la tâche doit être déplacée dans la corbeille
        if (completedSubtasks.length === subtasks.length) {
            moveToTrash(container.parentElement);
        }
    }
};

// 🔹 Ajout d'une sous-tâche
const addSubtask = (container, progressBar, mainCheckbox, text) => {
    if (text === "" || container.closest("#trash-list")) return; // Empêcher l'ajout en corbeille

    const subtask = document.createElement("li");
    subtask.classList.add("subtask");

    subtask.innerHTML = `
        <label>
            <input type="checkbox">
            <span>${text}</span>
        </label>
        <button class="delete-subtask">❌</button>
    `;

    const subtaskCheckbox = subtask.querySelector("input");
    subtaskCheckbox.addEventListener("change", () => {
        updateProgress(container, progressBar, mainCheckbox);
    });

    subtask.querySelector(".delete-subtask").addEventListener("click", () => {
        subtask.remove();
        updateProgress(container, progressBar, mainCheckbox);
    });

    container.appendChild(subtask);
    updateProgress(container, progressBar, mainCheckbox);
};

// 🔹 Ajout d'une nouvelle tâche
const addTask = () => {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const li = document.createElement("li");
    li.classList.add("task");

    const taskHeader = document.createElement("div");
    taskHeader.classList.add("task-header");

    taskHeader.innerHTML = `
        <label>
            <input type="checkbox" class="main-task-checkbox">
            <span>${taskText}</span>
        </label>
        <button class="delete-task">❌</button>
    `;

    const mainCheckbox = taskHeader.querySelector(".main-task-checkbox");

    // Vérifier si l'utilisateur veut des sous-tâches
    let hasSubtasks = confirm("Voulez-vous ajouter des sous-tâches à cette tâche ?");
    let subtaskContainer = document.createElement("ul");
    subtaskContainer.classList.add("subtasks");
    let subtaskInputDiv = document.createElement("div");
    let taskProgressBar = null;

    if (hasSubtasks) {
        // Barre de progression
        taskProgressBar = document.createElement("div");
        taskProgressBar.classList.add("progress");

        const progressBarContainer = document.createElement("div");
        progressBarContainer.classList.add("progress-bar-container");
        progressBarContainer.appendChild(taskProgressBar);

        li.appendChild(progressBarContainer);

        // Input pour ajouter une sous-tâche
        subtaskInputDiv.classList.add("task-input");
        const subtaskInput = document.createElement("input");
        subtaskInput.type = "text";
        subtaskInput.placeholder = "Ajouter une sous-tâche...";
        const addSubtaskBtn = document.createElement("button");
        addSubtaskBtn.innerText = "➕";

        subtaskInputDiv.appendChild(subtaskInput);
        subtaskInputDiv.appendChild(addSubtaskBtn);

        // Ajout d'une sous-tâche au clic
        addSubtaskBtn.addEventListener("click", () => {
            addSubtask(subtaskContainer, taskProgressBar, mainCheckbox, subtaskInput.value.trim());
            subtaskInput.value = "";
        });

        // Ajout d'une sous-tâche avec la touche "Enter"
        subtaskInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addSubtask(subtaskContainer, taskProgressBar, mainCheckbox, subtaskInput.value.trim());
                subtaskInput.value = "";
            }
        });
    } else {
        subtaskContainer.style.display = "none"; // Pas de sous-tâches affichées
    }

    // Gestion du check/uncheck de la tâche principale
    mainCheckbox.addEventListener("change", (e) => {
        const isChecked = e.target.checked;

        if (hasSubtasks) {
            subtaskContainer.querySelectorAll("input").forEach((cb) => {
                cb.checked = isChecked;
            });
            updateProgress(subtaskContainer, taskProgressBar, mainCheckbox);
        } else {
            moveToTrash(li);
        }
    });

    taskHeader.querySelector(".delete-task").addEventListener("click", () => {
        li.remove();
    });

    li.appendChild(taskHeader);
    li.appendChild(subtaskContainer);
    if (hasSubtasks) li.appendChild(subtaskInputDiv);
    taskList.appendChild(li);
    taskInput.value = "";
};

// 🔹 Déplacement d'une tâche vers la corbeille
const moveToTrash = (taskElement) => {
    if (taskElement.parentElement === trashList) return;

    const confirmation = confirm("Cette tâche est-elle bien terminée et peut-elle être déplacée dans la corbeille ?");
    if (confirmation) {
        const checkboxes = taskElement.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach((cb) => {
            cb.checked = true;
            cb.disabled = true;
        });

        const subtaskInputDiv = taskElement.querySelector(".task-input");
        if (subtaskInputDiv) subtaskInputDiv.style.display = "none";

        trashList.appendChild(taskElement);

        const restoreBtn = document.createElement("button");
        restoreBtn.innerText = "♻️ Restaurer";
        restoreBtn.classList.add("restore-task");
        taskElement.querySelector(".task-header").appendChild(restoreBtn);

        restoreBtn.addEventListener("click", () => {
            restoreTask(taskElement);
        });
    }
};

// 🔹 Restaurer une tâche depuis la corbeille
const restoreTask = (taskElement) => {
    const restoreBtn = taskElement.querySelector(".restore-task");
    if (restoreBtn) restoreBtn.remove();

    const checkboxes = taskElement.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((cb) => {
        cb.disabled = false;
    });

    const subtaskInputDiv = taskElement.querySelector(".task-input");
    if (subtaskInputDiv) subtaskInputDiv.style.display = "block"; // Réafficher l'ajout de sous-tâches

    taskList.appendChild(taskElement);
};

// Gestion des événements
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
});
