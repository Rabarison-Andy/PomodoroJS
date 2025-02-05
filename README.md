# PomodoroJS
Petit projet permettant de créer, organiser et suivre l'avancement des tâches et sous-tâches. Tout ça est couplés à une horloge appliquant la technique pomodoro.

## **Structure du Code JavaScript**

Le code JavaScript se divise principalement en gestion des tâches et sous-tâches, gestion de la corbeille, mise à jour des éléments et gestion des événements utilisateur.

### **Variables Globales**

Les éléments du DOM sont récupérés au début pour faciliter leur manipulation dans les différentes fonctions :

```javascript
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const trashList = document.getElementById("trash-list");
```

---

## **Principales Fonctions**

### **1. `addTask()`**

Cette fonction est responsable de la création d'une nouvelle tâche. Elle crée un élément `<li>` représentant une tâche et l'ajoute à la liste principale des tâches (`taskList`).

- Si la tâche a des sous-tâches, un formulaire d'ajout de sous-tâches est affiché.
- Si la tâche n'a pas de sous-tâches, la barre de progression est omise.
- Si la tâche est terminée (case cochée), elle est déplacée vers la corbeille.

```javascript
const addTask = () => {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const li = document.createElement("li");
    li.classList.add("task");

    // Ajout de l'entête de la tâche
    const taskHeader = document.createElement("div");
    taskHeader.classList.add("task-header");
    taskHeader.innerHTML = `
        <label>
            <input type="checkbox" class="main-task-checkbox">
            <span>${taskText}</span>
        </label>
        <button class="delete-task">❌</button>
    `;

    // Ajout de la barre de progression et sous-tâches
    const progressBarContainer = document.createElement("div");
    const taskProgressBar = document.createElement("div");
    progressBarContainer.appendChild(taskProgressBar);

    const subtaskContainer = document.createElement("ul");
    const subtaskInputDiv = document.createElement("div");
    subtaskInputDiv.classList.add("task-input");

    const subtaskInput = document.createElement("input");
    subtaskInput.type = "text";
    const addSubtaskBtn = document.createElement("button");
    addSubtaskBtn.innerText = "➕";

    subtaskInputDiv.appendChild(subtaskInput);
    subtaskInputDiv.appendChild(addSubtaskBtn);

    // Gestion de l'ajout de sous-tâches
    addSubtaskBtn.addEventListener("click", () => {
        addSubtask(subtaskContainer, taskProgressBar, mainCheckbox, subtaskInput.value.trim());
        subtaskInput.value = "";
    });

    // Vérification de l'option pour les sous-tâches
    const hasSubtasks = confirm("Voulez-vous ajouter des sous-tâches à cette tâche ?");
    if (!hasSubtasks) {
        subtaskInputDiv.style.display = "none";
    }

    // Ajout des éléments à la tâche
    li.appendChild(taskHeader);
    li.appendChild(progressBarContainer);
    li.appendChild(subtaskContainer);
    li.appendChild(subtaskInputDiv);
    taskList.appendChild(li);
};
```

### **2. `addSubtask()`**

Cette fonction permet d'ajouter une sous-tâche à une tâche existante. Elle ajoute un élément `<li>` contenant un champ de saisie pour la sous-tâche et une case à cocher. 

Lorsque la case à cocher d'une sous-tâche est modifiée, la fonction `updateProgress()` est appelée pour mettre à jour la barre de progression de la tâche principale.

```javascript
const addSubtask = (container, progressBar, mainCheckbox, text) => {
    if (text === "") return;

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

    // Gestion des changements de sous-tâche
    subtaskCheckbox.addEventListener("change", () => {
        updateProgress(container, progressBar, mainCheckbox);
    });

    // Suppression de la sous-tâche
    subtask.querySelector(".delete-subtask").addEventListener("click", () => {
        subtask.remove();
        updateProgress(container, progressBar, mainCheckbox);
    });

    container.appendChild(subtask);
    updateProgress(container, progressBar, mainCheckbox);
};
```

### **3. `updateProgress()`**

Cette fonction met à jour la barre de progression d'une tâche en fonction de l'état des sous-tâches. Elle calcule le pourcentage de sous-tâches terminées et ajuste la largeur de la barre de progression. Elle met également à jour la case à cocher de la tâche principale si toutes les sous-tâches sont terminées.

```javascript
const updateProgress = (container, progressBar, mainCheckbox) => {
    const subtasks = container.querySelectorAll(".subtask");
    const completedSubtasks = container.querySelectorAll("input:checked");

    const progress = subtasks.length > 0 ? (completedSubtasks.length / subtasks.length) * 100 : 0;
    progressBar.style.width = `${progress}%`;

    // Mise à jour de la checkbox principale sans déclencher d'événement
    mainCheckbox.checked = subtasks.length > 0 && completedSubtasks.length === subtasks.length;
};
```

### **4. `moveToTrash()`**

Lorsqu'une tâche est marquée comme terminée, elle est déplacée dans la corbeille. Cette fonction vérifie d'abord que la tâche est terminée, puis déplace la tâche dans la corbeille. Elle ajoute également un bouton pour restaurer la tâche.

```javascript
const moveToTrash = (taskElement) => {
    const confirmation = confirm("Cette tâche est-elle bien terminée et peut-elle être déplacée dans la corbeille ?");
    if (confirmation) {
        // Supprimer les sous-tâches cochées
        const checkboxes = taskElement.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach((cb) => (cb.checked = false));

        // Déplacer la tâche dans la corbeille
        trashList.appendChild(taskElement);

        // Ajouter un bouton pour restaurer la tâche
        const restoreBtn = document.createElement("button");
        restoreBtn.innerText = "♻️ Restaurer";
        restoreBtn.classList.add("restore-task");
        taskElement.querySelector(".task-header").appendChild(restoreBtn);

        // Gérer la restauration
        restoreBtn.addEventListener("click", () => {
            restoreTask(taskElement);
        });
    }
};
```

### **5. `restoreTask()`**

Permet de restaurer une tâche de la corbeille vers la liste principale. Cette fonction retire le bouton de restauration et réajoute la tâche à la liste principale.

```javascript
const restoreTask = (taskElement) => {
    // Retirer le bouton "Restaurer"
    const restoreBtn = taskElement.querySelector(".restore-task");
    if (restoreBtn) restoreBtn.remove();

    // Remettre la tâche dans la liste principale
    taskList.appendChild(taskElement);
};
```
