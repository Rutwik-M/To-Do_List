document.addEventListener('DOMContentLoaded', () => {
    let categories = [
        { id: 1, name: "Work" },
        { id: 2, name: "Personal" },
        { id: 3, name: "Shopping" },
        { id: 4, name: "Errands" },
        { id: 5, name: "Projects" },
        { id: 6, name: "Someday/Maybe" }
    ];

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

    let currentCategoryId = categories[0]?.id || 1; // Default to first category's ID
    let nextTaskId = (tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0) + 1;
    let sortableInstance = null;

   
    const categoryListEl = document.getElementById('category-list');
    const taskListEl = document.getElementById('task-list');
    const currentCategoryTitleEl = document.getElementById('current-category-title');
    const newTaskInputEl = document.getElementById('new-task-input');
    const addTaskBtnEl = document.getElementById('add-task-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn?.querySelector('i');
    const progressBarEl = document.getElementById('progress-bar');
    const progressTextEl = document.getElementById('progress-text');
    const welcomeMessageEl = document.getElementById('welcome-message');
    const currentYearEl = document.getElementById('current-year');
    const emptyStateEl = document.getElementById('empty-state');
    const bodyEl = document.body;

    const mobileMenuToggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebarEl = document.getElementById('sidebar');
    const sidebarOverlayEl = document.getElementById('sidebar-overlay');
    const sidebarCloseBtnEl = document.getElementById('sidebar-close-btn');

    const viewContainerEl = document.getElementById('view-container');
    const mainNavEl = document.getElementById('main-nav');
    const dashboardViewEl = document.getElementById('dashboard-view');
    const settingsViewEl = document.getElementById('settings-view');
    const settingsTitleEl = document.getElementById('settings-title'); // Added for focus management

    const themeToggleSettingsBtn = document.getElementById('theme-toggle-settings');
    const themeIconSettings = themeToggleSettingsBtn?.querySelector('i');
    const currentThemeNameEl = document.getElementById('current-theme-name');
    const clearAllTasksBtn = document.getElementById('clear-all-tasks-btn');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');


    // --- Core Functions ---

    function getTaskCounts() {
        const counts = {};
        categories.forEach(cat => {
            counts[cat.id] = tasks.filter(task => task.categoryId === cat.id && !task.completed).length;
        });
        return counts;
    }

    /** Updates the main heading with the current category name. */
    function updateCategoryTitle() {
        if (!currentCategoryTitleEl) return;
        const currentCategory = categories.find(cat => cat.id === currentCategoryId);
        currentCategoryTitleEl.textContent = currentCategory ? currentCategory.name : "Tasks";
    }

    /** Updates the progress bar and text based on tasks in the current category. */
    function updateProgressBar(currentTasks) {
        if (!progressBarEl || !progressTextEl) return;

        const totalTasks = currentTasks.length;
        const completedTasks = currentTasks.filter(task => task.completed).length;
        let percentage = 0;
        let progressText = 'No tasks in this category';

        if (totalTasks > 0) {
            percentage = Math.round((completedTasks / totalTasks) * 100);
            progressText = `${percentage}% Complete (${completedTasks} of ${totalTasks})`;
        }

        requestAnimationFrame(() => {
            progressBarEl.style.width = `${percentage}%`;
            progressBarEl.setAttribute('aria-valuenow', percentage);
        });
        progressTextEl.textContent = progressText;
        progressTextEl.setAttribute('aria-label', `Progress: ${progressText}`); 
    }


    function setWelcomeMessage() {
        if (!welcomeMessageEl) return;
        const hour = new Date().getHours();
        let greeting;
        // ... (greeting logic remains the same) ...
        if (hour < 5) { greeting = "Working late or starting early?"; }
        else if (hour < 12) { greeting = "Good morning! What's the plan for today?"; }
        else if (hour < 17) { greeting = "Good afternoon! Keep up the momentum."; }
        else if (hour < 21) { greeting = "Good evening! Time to wrap up or wind down?"; }
        else { greeting = "Good night! Hope you had a productive day."; }
        welcomeMessageEl.textContent = greeting;
        welcomeMessageEl.style.opacity = 1;
    }

    
    function setCurrentYear() {
        if (currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    // --- Rendering Functions ---

    function renderCategories() {
        if (!categoryListEl) return;
        const settingsLinkLI = categoryListEl.querySelector('.sidebar-nav-item[data-view="settings"]');
        const separatorLI = categoryListEl.querySelector('.sidebar-separator');

        categoryListEl.querySelectorAll('li:not(.sidebar-nav-item):not(.sidebar-separator)')
            .forEach(li => li.remove());

        const taskCounts = getTaskCounts();

        categories.forEach(category => {
            const li = document.createElement('li');
            li.dataset.categoryId = category.id;
            li.classList.add('category-list-item'); 
            if (category.id === currentCategoryId) {
                li.classList.add('active');
                li.setAttribute('aria-current', 'page');
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
                if (currentCategoryId !== category.id) {
                    currentCategoryId = category.id;
                    switchView('dashboard'); 
                    renderCategories(); 
                    renderTasks();      
                }
                closeMobileSidebar(); 
            });

            
            if (separatorLI) {
                 categoryListEl.insertBefore(li, separatorLI);
            } else if (settingsLinkLI) {
                categoryListEl.insertBefore(li, settingsLinkLI);
            } else {
                categoryListEl.appendChild(li);
            }
        });
        updateCategoryTitle();
    }


    function renderTasks() {
        if (!taskListEl || !emptyStateEl) return;

        taskListEl.innerHTML = ''; // Clear previous tasks

        const currentTasks = tasks
            .filter(task => task.categoryId === currentCategoryId)
            .sort((a, b) => a.order - b.order);

        const listShouldBeVisible = currentTasks.length > 0;

        if (listShouldBeVisible) {
            emptyStateEl.style.display = 'none';
            taskListEl.style.display = 'block';

            currentTasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.classList.add('task-item');
                li.dataset.taskId = task.id;
                if (task.completed) {
                    li.classList.add('completed');
                }

                
                li.style.opacity = 0;
                li.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    li.style.opacity = 1;
                    li.style.transform = 'translateY(0)';
                    li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                }, index * 60);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.id = `task-${task.id}`; // Add id for label association
                checkbox.setAttribute('aria-labelledby', `task-label-${task.id}`);
                checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

                const span = document.createElement('span');
                span.classList.add('task-text');
                span.textContent = task.text;
                span.id = `task-label-${task.id}`; // Label text associated with checkbox

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`); // More specific label
                deleteBtn.innerHTML = "<i class='bx bx-trash' aria-hidden='true'></i>"; // Hide icon from screen reader
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                });

                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(deleteBtn);
                taskListEl.appendChild(li);
            });
        } else {
            emptyStateEl.style.display = 'flex';
            taskListEl.style.display = 'none';
        }

        updateProgressBar(currentTasks);
        initializeSortable(listShouldBeVisible);
    }


    // --- SortableJS ---

    function initializeSortable(listShouldBeVisible) {
        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
        }

        if (taskListEl && listShouldBeVisible && typeof Sortable !== 'undefined') {
            try {
                sortableInstance = new Sortable(taskListEl, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    chosenClass: 'sortable-chosen',
                    dragClass: 'sortable-drag',
                    handle: '.task-text', 
                    onEnd: function (evt) {
                        if (evt.oldIndex !== evt.newIndex) {
                            updateTaskOrder(evt.oldIndex, evt.newIndex);
                        }
                    },
                });
            } catch (error) {
                console.error("Error initializing SortableJS:", error);
            }
        }
    }

   
    function updateTaskOrder(oldIndex, newIndex) {
        const currentlyDisplayedTasks = tasks
            .filter(task => task.categoryId === currentCategoryId)
            .sort((a, b) => a.order - b.order);

        const [movedTaskObject] = currentlyDisplayedTasks.splice(oldIndex, 1);
        currentlyDisplayedTasks.splice(newIndex, 0, movedTaskObject);

        currentlyDisplayedTasks.forEach((taskData, index) => {
            const taskToUpdate = tasks.find(t => t.id === taskData.id);
            if (taskToUpdate) {
                taskToUpdate.order = index + 1;
            }
        });
        
         console.log("Task order updated in memory.");
    }


    // --- Task Actions ---

    
    function addTask() {
        if (!newTaskInputEl) return;
        const taskText = newTaskInputEl.value.trim();
        if (taskText === '') {
            newTaskInputEl.focus();
            newTaskInputEl.classList.add('input-error-shake');
            setTimeout(() => newTaskInputEl.classList.remove('input-error-shake'), 500);
            return;
        }

        const currentTasks = tasks.filter(task => task.categoryId === currentCategoryId);
        const maxOrder = currentTasks.reduce((max, task) => Math.max(max, task.order || 0), 0);

        const newTask = {
            id: nextTaskId++,
            categoryId: currentCategoryId,
            text: taskText,
            completed: false,
            order: maxOrder + 1
        };

        tasks.push(newTask);
       
        newTaskInputEl.value = '';
        renderTasks();
        renderCategories(); 
    }

    function toggleTaskCompletion(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
           
            renderTasks(); 
            renderCategories();
        }
    }


    function deleteTask(taskId) {
        const taskItem = taskListEl?.querySelector(`li.task-item[data-task-id="${taskId}"]`);

        if (taskItem) {
            taskItem.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, margin-bottom 0.3s ease-out, padding 0.3s ease-out, height 0.3s ease-out';
            taskItem.style.opacity = '0';
            taskItem.style.transform = 'translateX(-30px)';
            taskItem.style.marginBottom = '0';
            taskItem.style.paddingTop = '0';
            taskItem.style.paddingBottom = '0';
            // Set height explicitly to current height, then animate to 0
            taskItem.style.height = `${taskItem.offsetHeight}px`;
            requestAnimationFrame(() => {
                 taskItem.style.height = '0';
            });


            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== taskId);
                // TODO: Consider saving the updated 'tasks' array to localStorage here.
                renderTasks();
                renderCategories();
                // Optional: Announce deletion
                // announce(`Task deleted.`);
            }, 300); // Match CSS transition duration
        } else {
            // Fallback if item not found (shouldn't normally happen)
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            renderCategories();
        }
    }

    // --- Theme Management ---

    /** Toggles the dark/light theme. */
    function toggleTheme() {
        bodyEl.classList.toggle('dark-theme');
        const isDarkMode = bodyEl.classList.contains('dark-theme');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIconsAndText(isDarkMode);
    }

    /** Updates theme icons and text. */
    function updateThemeIconsAndText(isDarkMode) {
        const themeName = isDarkMode ? 'Dark' : 'Light';
        const newIconClass = `bx ${isDarkMode ? 'bx-sun' : 'bx-moon'}`;
        const newAriaLabel = `Switch to ${isDarkMode ? 'Light' : 'Dark'} Theme`;

        if (themeIcon) { themeIcon.className = newIconClass; }
        if (themeToggleBtn) { themeToggleBtn.setAttribute('aria-label', newAriaLabel); }

        if (themeIconSettings) { themeIconSettings.className = newIconClass; }
        if (themeToggleSettingsBtn) { themeToggleSettingsBtn.setAttribute('aria-label', newAriaLabel); }

        if (currentThemeNameEl) { currentThemeNameEl.textContent = themeName; }
    }


    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const isDarkMode = savedTheme === 'dark'; // || (savedTheme === null && prefersDark);

        if (isDarkMode) { bodyEl.classList.add('dark-theme'); }
        else { bodyEl.classList.remove('dark-theme'); }
        updateThemeIconsAndText(isDarkMode);
    }

    // --- Mobile Sidebar ---

    function openMobileSidebar() {
        if (!sidebarEl || !sidebarOverlayEl || !mobileMenuToggleBtn) return;
        sidebarEl.classList.add('active');
        sidebarOverlayEl.classList.add('active'); // Show overlay
        sidebarOverlayEl.setAttribute('aria-hidden', 'false');
        mobileMenuToggleBtn.setAttribute('aria-expanded', 'true'); // Update aria state
        bodyEl.style.overflow = 'hidden'; // Prevent background scroll
        sidebarCloseBtnEl?.focus(); // Move focus to close button
    }

    function closeMobileSidebar() {
        if (!sidebarEl || !sidebarOverlayEl || !mobileMenuToggleBtn) return;
        sidebarEl.classList.remove('active');
        sidebarOverlayEl.classList.remove('active'); // Hide overlay
        sidebarOverlayEl.setAttribute('aria-hidden', 'true');
        mobileMenuToggleBtn.setAttribute('aria-expanded', 'false'); // Update aria state
        bodyEl.style.overflow = ''; // Restore background scroll
        mobileMenuToggleBtn.focus(); // Return focus to the toggle button
    }

    // --- View Switching ---

    function switchView(viewName) {
        if (!viewContainerEl || !mainNavEl || !dashboardViewEl || !settingsViewEl) {
            console.error("View switching elements not found.");
            return;
        }

        const isSwitchingToSettings = viewName === 'settings';

        mainNavEl.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewName);
             link.setAttribute('aria-current', link.dataset.view === viewName ? 'page' : 'false');
        });

        viewContainerEl.classList.toggle('settings-active', isSwitchingToSettings);

        if (isSwitchingToSettings) {
            dashboardViewEl.setAttribute('aria-hidden', 'true');
            settingsViewEl.setAttribute('aria-hidden', 'false');
            setTimeout(() => settingsTitleEl?.focus(), 600);
        } else {
            dashboardViewEl.setAttribute('aria-hidden', 'false');
            settingsViewEl.setAttribute('aria-hidden', 'true');
            setTimeout(() => currentCategoryTitleEl?.focus(), 600);
        }

  
        closeMobileSidebar();

        console.log(`Switched view to: ${viewName}`);
    }

    function clearAllTasks() {
        if (confirm("Are you sure you want to delete ALL tasks in ALL categories? This cannot be undone.")) {
            tasks = [];
            currentCategoryId = categories[0]?.id || 1;
            nextTaskId = 1;
            renderCategories();
            renderTasks();
            alert("All tasks cleared.");
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        if (addTaskBtnEl) addTaskBtnEl.addEventListener('click', addTask);
        if (newTaskInputEl) {
            newTaskInputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTask();
            });
        }

        if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

        // Mobile Menu
        if (mobileMenuToggleBtn) mobileMenuToggleBtn.addEventListener('click', openMobileSidebar);
        if (sidebarCloseBtnEl) sidebarCloseBtnEl.addEventListener('click', closeMobileSidebar);
        if (sidebarOverlayEl) sidebarOverlayEl.addEventListener('click', closeMobileSidebar);

        // View Switching (Header Nav - Event Delegation)
        if (mainNavEl) {
            mainNavEl.addEventListener('click', (e) => {
                const targetLink = e.target.closest('.nav-link[data-view]');
                if (targetLink && !targetLink.classList.contains('active')) { // Only switch if not already active
                    e.preventDefault();
                    switchView(targetLink.dataset.view);
                }
            });
        }

        // View Switching (Sidebar Settings Link - Event Delegation on category list)
        if (categoryListEl) {
             categoryListEl.addEventListener('click', (e) => {
                 const settingsLink = e.target.closest('.sidebar-nav-item[data-view="settings"]');
                 if (settingsLink) {
                     e.preventDefault();
                     switchView('settings'); // Use the switchView function
                     // closeMobileSidebar(); // switchView already calls this
                 }
                 // Category item clicks are handled directly on the LI elements during render
             });
        }


        // Settings View
        if (themeToggleSettingsBtn) themeToggleSettingsBtn.addEventListener('click', toggleTheme);
        if (clearAllTasksBtn) clearAllTasksBtn.addEventListener('click', clearAllTasks);
        if (backToDashboardBtn) {
            // Use data-view attribute from HTML instead of direct listener if preferred
             backToDashboardBtn.addEventListener('click', () => switchView('dashboard'));
        }

         // Close sidebar on Escape key press
         document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && sidebarEl?.classList.contains('active')) {
                closeMobileSidebar();
            }
        });
    }


    // --- Initial Setup ---

    function initializeApp() {
        window.addEventListener('load', () => {
           setTimeout(() => bodyEl.classList.remove('preload'), 100);
        });

        applySavedTheme();
        setWelcomeMessage();
        setCurrentYear();
        renderCategories(); 
        renderTasks();     
        setupEventListeners(); 
        console.log("SereneList Initialized.");

        if (dashboardViewEl) dashboardViewEl.setAttribute('aria-hidden', 'false');
        if (settingsViewEl) settingsViewEl.setAttribute('aria-hidden', 'true');
        if (sidebarOverlayEl) sidebarOverlayEl.setAttribute('aria-hidden', 'true');
        if (mobileMenuToggleBtn) mobileMenuToggleBtn.setAttribute('aria-expanded', 'false');
    }

    initializeApp();

});