document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data ---
    let categories = [
        { id: 1, name: "Work" },
        { id: 2, name: "Personal" },
        { id: 3, name: "Shopping" },
        { id: 4, name: "Errands" },
        { id: 5, name: "Projects" },
        { id: 6, name: "Someday/Maybe" }
    ];

    // Ensure initial data has sequential 'order' within each category
    let tasks = [
        // Category 1: Work
        { id: 1, categoryId: 1, text: "Prepare presentation slides", completed: false, order: 1 },
        { id: 2, categoryId: 1, text: "Reply to client emails", completed: false, order: 2 },
        { id: 6, categoryId: 1, text: "Team meeting at 10 AM", completed: false, order: 3 },
        { id: 11, categoryId: 1, text: "Review project proposal", completed: false, order: 4 },
        // Category 2: Personal
        { id: 3, categoryId: 2, text: "Gym session", completed: true, order: 1 },
        { id: 4, categoryId: 2, text: "Read book chapter", completed: false, order: 2 },
        { id: 7, categoryId: 2, text: "Plan weekend trip", completed: false, order: 3 },
        // Category 3: Shopping
        { id: 5, categoryId: 3, text: "Buy groceries (milk, eggs, bread)", completed: false, order: 1 },
        { id: 8, categoryId: 3, text: "Order new light bulbs", completed: false, order: 2 },
        { id: 12, categoryId: 3, text: "Return online order", completed: false, order: 3 },
        // Category 4: Errands
        { id: 9, categoryId: 4, text: "Post office", completed: false, order: 1 },
        { id: 10, categoryId: 4, text: "Pick up dry cleaning", completed: true, order: 2 },
        // Category 5: Projects
        { id: 13, categoryId: 5, text: "Research component libraries", completed: false, order: 1 },
        { id: 14, categoryId: 5, text: "Draft initial UI mockups", completed: false, order: 2 },
        // Category 6: Someday/Maybe - Starts empty
    ];

    let currentCategoryId = 1; // Default to first category
    // Ensure nextTaskId starts higher than any existing ID
    let nextTaskId = (tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0) + 1;
    let sortableInstance = null; // To hold the SortableJS instance

    // --- DOM Elements ---
    const categoryListEl = document.getElementById('category-list');
    const taskListEl = document.getElementById('task-list');
    const currentCategoryTitleEl = document.getElementById('current-category-title');
    const newTaskInputEl = document.getElementById('new-task-input');
    const addTaskBtnEl = document.getElementById('add-task-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn?.querySelector('i'); // Use optional chaining
    const progressBarEl = document.getElementById('progress-bar');
    const progressTextEl = document.getElementById('progress-text');
    const welcomeMessageEl = document.getElementById('welcome-message');
    const currentYearEl = document.getElementById('current-year');
    const emptyStateEl = document.getElementById('empty-state');
    const bodyEl = document.body; // Get body element

    // Mobile Menu Elements
    const mobileMenuToggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebarEl = document.getElementById('sidebar');
    const sidebarOverlayEl = document.getElementById('sidebar-overlay');
    const sidebarCloseBtnEl = document.getElementById('sidebar-close-btn');


    // --- Core Functions ---

    /**
     * Calculates the count of active (non-completed) tasks for each category.
     * @returns {Object} An object mapping categoryId to active task count.
     */
    function getTaskCounts() {
        const counts = {};
        categories.forEach(cat => {
            counts[cat.id] = tasks.filter(task => task.categoryId === cat.id && !task.completed).length;
        });
        return counts;
    }

    /**
     * Updates the main heading with the current category name.
     */
    function updateCategoryTitle() {
        if (!currentCategoryTitleEl) return; // Guard clause
        const currentCategory = categories.find(cat => cat.id === currentCategoryId);
        currentCategoryTitleEl.textContent = currentCategory ? currentCategory.name : "Tasks";
        // Optional: Add animation trigger if needed
        // currentCategoryTitleEl.classList.add('title-updated');
        // setTimeout(() => currentCategoryTitleEl.classList.remove('title-updated'), 300);
    }

    /**
     * Updates the progress bar and text based on tasks in the current category.
     * @param {Array} currentTasks - The tasks currently displayed.
     */
    function updateProgressBar(currentTasks) {
        if (!progressBarEl || !progressTextEl) return; // Guard clauses

        const totalTasks = currentTasks.length;
        if (totalTasks === 0) {
            progressBarEl.style.width = '0%';
            progressTextEl.textContent = 'No tasks in this category';
            return;
        }
        const completedTasks = currentTasks.filter(task => task.completed).length;
        const percentage = Math.round((completedTasks / totalTasks) * 100);

        // Delay width update slightly for smoother visual perception after render
        requestAnimationFrame(() => {
             requestAnimationFrame(() => { // Double rAF helps ensure styles are flushed
                progressBarEl.style.width = `${percentage}%`;
             });
        });
        progressTextEl.textContent = `${percentage}% Complete (${completedTasks} of ${totalTasks})`;
    }

    /**
     * Sets a dynamic welcome message based on the time of day.
     */
    function setWelcomeMessage() {
        if (!welcomeMessageEl) return;
        const hour = new Date().getHours();
        let greeting;
        if (hour < 5) { greeting = "Working late or starting early?"; }
        else if (hour < 12) { greeting = "Good morning! What's the plan for today?"; }
        else if (hour < 17) { greeting = "Good afternoon! Keep up the momentum."; }
        else if (hour < 21) { greeting = "Good evening! Time to wrap up or wind down?"; }
        else { greeting = "Good night! Hope you had a productive day."; }
        welcomeMessageEl.textContent = greeting;
        // Ensure fade-in happens after text is set
        welcomeMessageEl.style.opacity = 0; // Start hidden if using JS fade
        setTimeout(() => { welcomeMessageEl.style.opacity = 1; }, 50); // Fade in shortly after
    }

    /**
     * Sets the current year in the footer.
     */
    function setCurrentYear() {
        if (currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    // --- Rendering Functions ---

    /**
     * Renders the category list in the sidebar, including task counts and active state.
     */
    function renderCategories() {
        if (!categoryListEl) return; // Guard clause
        categoryListEl.innerHTML = '';
        const taskCounts = getTaskCounts();

        categories.forEach(category => {
            const li = document.createElement('li');
            li.dataset.categoryId = category.id;
            if (category.id === currentCategoryId) {
                li.classList.add('active');
            }

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('category-name');
            nameSpan.textContent = category.name;

            const countSpan = document.createElement('span');
            countSpan.classList.add('category-count');
            countSpan.textContent = taskCounts[category.id] || 0;

            li.appendChild(nameSpan);
            li.appendChild(countSpan);

            li.addEventListener('click', () => {
                currentCategoryId = category.id;
                renderCategories(); // Re-render categories for active state/counts
                renderTasks();      // Render tasks for the new category
                closeMobileSidebar(); // Close sidebar after selecting a category on mobile
            });
            categoryListEl.appendChild(li);
        });
        updateCategoryTitle(); // Update title after rendering categories
    }

    /**
     * Renders the tasks for the currently selected category, handles empty state,
     * updates the progress bar, and initializes drag-and-drop.
     */
    function renderTasks() {
        if (!taskListEl || !emptyStateEl) return; // Guard clauses

        taskListEl.innerHTML = ''; // Clear previous tasks

        const currentTasks = tasks
            .filter(task => task.categoryId === currentCategoryId)
            .sort((a, b) => a.order - b.order); // Sort by current order

        let listShouldBeVisible = currentTasks.length > 0;

        if (listShouldBeVisible) {
            emptyStateEl.style.display = 'none';
            taskListEl.style.display = 'block'; // Ensure task list UL is visible

            currentTasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.classList.add('task-item');
                li.dataset.taskId = task.id;
                if (task.completed) {
                    li.classList.add('completed');
                }

                // Staggered animation via style delay (CSS handles animation)
                // Note: CSS needs an animation definition for .task-item for this to work visually
                // e.g., animation: task-fade-in 0.4s ease forwards;
                // If only using JS opacity/transform:
                li.style.opacity = 0;
                li.style.transform = 'translateY(10px)';
                setTimeout(() => {
                   li.style.opacity = 1;
                   li.style.transform = 'translateY(0)';
                   li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                }, index * 60); // Slightly increased delay

                // Checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.setAttribute('aria-label', `Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
                checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

                // Task Text
                const span = document.createElement('span');
                span.classList.add('task-text');
                span.textContent = task.text;

                // Delete Button
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
                deleteBtn.innerHTML = "<i class='bx bx-trash'></i>";
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering potential parent listeners
                    deleteTask(task.id);
                });

                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(deleteBtn);
                taskListEl.appendChild(li);
            });
        } else {
            emptyStateEl.style.display = 'flex'; // Use flex for centering icon/text
            taskListEl.style.display = 'none';
        }

        updateProgressBar(currentTasks);
        initializeSortable(listShouldBeVisible); // Initialize SortableJS based on visibility
    }


    // --- SortableJS ---

    /**
     * Initializes or re-initializes SortableJS for drag-and-drop functionality.
     * @param {boolean} listShouldBeVisible - Indicates if the task list currently has items.
     */
    function initializeSortable(listShouldBeVisible) {
        // Always destroy the previous instance to prevent memory leaks or duplicate listeners
        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
        }

        // Only initialize SortableJS if the list element exists AND it's currently visible/populated
        if (taskListEl && listShouldBeVisible && typeof Sortable !== 'undefined') { // Add check for Sortable
            sortableInstance = new Sortable(taskListEl, {
                animation: 150, // ms animation speed
                ghostClass: 'sortable-ghost', // Class name for the drop placeholder
                chosenClass: 'sortable-chosen', // Class name for the chosen item
                dragClass: 'sortable-drag', // Class name for the dragging item
                onEnd: function (evt) {
                    // evt.oldIndex — element's old index within parent
                    // evt.newIndex — element's new index within parent
                    if (evt.oldIndex !== evt.newIndex) { // Only update if position actually changed
                         updateTaskOrder(evt.oldIndex, evt.newIndex);
                    }
                },
            });
        }
    }

    /**
     * Updates the `order` property in the main `tasks` array after a drag-and-drop operation.
     * @param {number} oldIndex - The original index of the dragged item within the visible list.
     * @param {number} newIndex - The new index of the dragged item within the visible list.
     */
    function updateTaskOrder(oldIndex, newIndex) {
        // Get the tasks currently displayed (filtered for the category and sorted by the current order)
        const currentlyDisplayedTasks = tasks
            .filter(task => task.categoryId === currentCategoryId)
            .sort((a, b) => a.order - b.order);

        // Remove the moved task object from its old position in this temporary, sorted array
        const [movedTaskObject] = currentlyDisplayedTasks.splice(oldIndex, 1);

        // Insert the moved task object into its new position in the temporary array
        currentlyDisplayedTasks.splice(newIndex, 0, movedTaskObject);

        // Re-assign the 'order' property sequentially based on the new array sequence
        currentlyDisplayedTasks.forEach((taskData, index) => {
            // Find the corresponding task in the main 'tasks' array using its ID
            const taskToUpdate = tasks.find(t => t.id === taskData.id);
            if (taskToUpdate) {
                taskToUpdate.order = index + 1; // Re-assign order starting from 1
            }
        });
        // Data model is updated, SortableJS handled the visual DOM change.
    }


    // --- Task Actions ---

    /**
     * Adds a new task based on the input field value.
     */
    function addTask() {
        if (!newTaskInputEl) return; // Guard clause
        const taskText = newTaskInputEl.value.trim();
        if (taskText === '') {
            // Optional: Add feedback like shaking the input
             newTaskInputEl.focus();
             // Example: Add a temporary shake class
             newTaskInputEl.classList.add('input-error-shake');
             setTimeout(() => newTaskInputEl.classList.remove('input-error-shake'), 500); // Match CSS animation duration
            return;
        }

        // Determine the next order number for the current category
        const currentTasks = tasks.filter(task => task.categoryId === currentCategoryId);
        const maxOrder = currentTasks.reduce((max, task) => Math.max(max, task.order || 0), 0);

        const newTask = {
            id: nextTaskId++,
            categoryId: currentCategoryId,
            text: taskText,
            completed: false,
            order: maxOrder + 1 // Assign the next available order number
        };

        tasks.push(newTask);
        newTaskInputEl.value = ''; // Clear input field
        renderTasks(); // Re-render tasks to show the new one (includes progress update)
        renderCategories(); // Re-render categories to update task counts
    }

    /**
     * Toggles the completion status of a task.
     * @param {number} taskId - The ID of the task to toggle.
     */
    function toggleTaskCompletion(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            // Find the corresponding list item to add/remove animation class if desired
            const taskItem = taskListEl?.querySelector(`li.task-item[data-task-id="${taskId}"]`);
            if(taskItem){
                // Optionally add a class for CSS transition feedback
                // taskItem.classList.add('task-toggled');
                // setTimeout(()=> taskItem.classList.remove('task-toggled'), 300);
            }
            renderTasks(); // Re-render tasks (updates style, progress bar)
            renderCategories(); // Re-render categories (updates counts)
        }
    }

    /**
     * Deletes a task with a fade-out animation.
     * @param {number} taskId - The ID of the task to delete.
     */
     function deleteTask(taskId) {
        const taskItem = taskListEl?.querySelector(`li.task-item[data-task-id="${taskId}"]`);

        if(taskItem) {
             // Apply animation styles directly or add a class
             taskItem.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, margin-bottom 0.3s ease-out, padding 0.3s ease-out, height 0.3s ease-out';
             taskItem.style.opacity = '0';
             taskItem.style.transform = 'translateX(-30px)';
             taskItem.style.marginBottom = '0';
             taskItem.style.paddingTop = '0';
             taskItem.style.paddingBottom = '0';
             taskItem.style.height = '0';
             // taskItem.style.borderWidth = '0'; // If borders interfere

             // Wait for animation to complete before removing data and re-rendering
             setTimeout(() => {
                 tasks = tasks.filter(t => t.id !== taskId);
                 // Note: Re-calculating order after deletion might be desired in a real app
                 renderTasks();      // Re-render tasks (updates list, progress)
                 renderCategories(); // Re-render categories (updates counts)
            }, 300); // Match timeout to CSS transition duration
        } else {
            // Fallback if item not found (e.g., deleted very quickly)
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            renderCategories();
        }
    }

    // --- Theme Management ---

    /**
     * Toggles the dark/light theme on the body element.
     */
    function toggleTheme() {
        bodyEl.classList.toggle('dark-theme');
        updateThemeIcon(); // Update the button icon
        // Save preference to localStorage
        localStorage.setItem('theme', bodyEl.classList.contains('dark-theme') ? 'dark' : 'light');
    }

    /**
     * Updates the theme toggle button icon based on the current theme.
     */
     function updateThemeIcon() {
        if (!themeIcon) return; // Guard clause
        if (bodyEl.classList.contains('dark-theme')) {
            themeIcon.classList.remove('bx-moon');
            themeIcon.classList.add('bx-sun');
            themeToggleBtn.setAttribute('aria-label', 'Switch to Light Theme');
        } else {
            themeIcon.classList.remove('bx-sun');
            themeIcon.classList.add('bx-moon');
            themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Theme');
        }
     }

    /**
     * Applies the theme preference saved in localStorage on page load.
     */
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        // Set class based on saved theme or default to light
        if (savedTheme === 'dark') {
            bodyEl.classList.add('dark-theme');
        } else {
            bodyEl.classList.remove('dark-theme'); // Ensure light if not dark
        }
         updateThemeIcon(); // Set the correct icon on initial load
    }

    // --- Mobile Sidebar ---

    /**
     * Opens the mobile sidebar menu.
     */
    function openMobileSidebar() {
        if (sidebarEl && sidebarOverlayEl) {
            sidebarEl.classList.add('active');
            sidebarOverlayEl.classList.add('active');
            bodyEl.style.overflow = 'hidden'; // Prevent background scroll when menu is open
        }
    }

    /**
     * Closes the mobile sidebar menu.
     */
    function closeMobileSidebar() {
         if (sidebarEl && sidebarOverlayEl) {
            sidebarEl.classList.remove('active');
            sidebarOverlayEl.classList.remove('active');
            bodyEl.style.overflow = ''; // Restore background scroll
        }
    }

    // --- Event Listeners ---
    // Ensure elements exist before adding listeners
    if (addTaskBtnEl) {
        addTaskBtnEl.addEventListener('click', addTask);
    }
    if (newTaskInputEl) {
        newTaskInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Mobile Menu Listeners
    if (mobileMenuToggleBtn) {
        mobileMenuToggleBtn.addEventListener('click', openMobileSidebar);
    }
    if (sidebarCloseBtnEl) {
        sidebarCloseBtnEl.addEventListener('click', closeMobileSidebar);
    }
    if (sidebarOverlayEl) {
        sidebarOverlayEl.addEventListener('click', closeMobileSidebar);
    }


    // --- Initial Setup ---

    /**
     * Initializes the application: applies theme, sets static content, renders dynamic content.
     */
    function initializeApp() {
        // Remove preload class shortly after load to enable transitions
        window.addEventListener('load', () => {
           setTimeout(() => bodyEl.classList.remove('preload'), 100); // Small delay
        });

        applySavedTheme();    // Apply theme first
        setWelcomeMessage();
        setCurrentYear();
        renderCategories();   // Render categories
        renderTasks();        // Then render tasks for the default category
        console.log("SereneList Initialized.");
    }

    initializeApp(); // Run the initialization sequence

}); // End of DOMContentLoaded

// Helper CSS class for input shake (add this to style.css if desired)
/*
@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-3px); }
  40%, 60% { transform: translateX(3px); }
}
.input-error-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
*/