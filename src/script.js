/**
 * Klasse zur Verwaltung einer To-Do-Liste mit Funktionen zum Hinzufügen, Löschen und Rendern von Aufgaben.
 */
class ToDo {
    /**
     * Selektoren für DOM-Elemente, die in der Anwendung verwendet werden.
     * Diese Objekte enthalten data-Attribute, um die Elemente eindeutig zu identifizieren.
     */
    selectors = {
        root: '[data-js-todo]', // Hauptelement der To-Do-Liste
        newTaskForm: '[data-js-todo-new-task-form]', // Formular zum Hinzufügen neuer Aufgaben
        newTaskInput: '[data-js-todo-new-task-input]', // Eingabefeld für neue Aufgaben
        searchTaskForm: '[data-js-todo-search-task-form]', // Formular für die Aufgabensuche
        seacrhTaskInput: '[data-js-todo-search-task-input]', // Eingabefeld für die Suche
        totalTasks: '[data-js-todo-total-tasks]', // Anzeige der Gesamtzahl der Aufgaben
        deletaAllButton: '[data-js-todo-delete-all-button]', // Button zum Löschen aller Aufgaben
        list: '[data-js-todo-list]', // Container für die Aufgabenliste
        item: '[data-js-todo-item]', // Einzelnes Aufgabenelement
        itemCheckbox: '[data-js-todo-item-checkbox]', // Checkbox für Aufgabenstatus
        itemLabel: '[data-js-todo-item-label]', // Label der Aufgabe
        itemDeleteButton: '[data-js-todo-item-delete-button]', // Button zum Löschen einer Aufgabe
        empty: '[data-js-todo-empty]', // Container für leere Zustandsmeldungen
    }

    /**
     * CSS-Klassen für Zustandsänderungen der UI-Elemente.
     */
    stateClasses = {
        isVisible: 'is-visible', // Klasse zur Anzeige von Elementen
        isDisappearing: 'is-disappearing' // Klasse für verschwindende Animationen
    }

    /**
     * Schlüssel für den LocalStorage, um Aufgaben zu speichern.
     */
    localStorageKey = 'todo-items'

    /**
     * Konstruktor: Initialisiert die DOM-Elemente und den Zustand der Anwendung.
     */
    constructor() {
        // Zugriff auf das Hauptelement der To-Do-Liste
        this.rootElement = document.querySelector(this.selectors.root)
        // Zugriff auf das Formular zum Hinzufügen neuer Aufgaben
        this.newTaskFormElement = this.rootElement.querySelector(this.selectors.newTaskForm)
        // Zugriff auf das Eingabefeld für neue Aufgaben
        this.newTaskInputElement = this.rootElement.querySelector(this.selectors.newTaskInput)
        // Zugriff auf das Eingabefeld für die Suche
        this.searchTaskInputElement = this.rootElement.querySelector(this.selectors.seacrhTaskInput)
        // Zugriff auf das Element, das die Gesamtzahl der Aufgaben anzeigt
        this.totalTasksElement = this.rootElement.querySelector(this.selectors.totalTasks)
        // Zugriff auf den Button zum Löschen aller Aufgaben
        this.deletaAllButtonElement = this.rootElement.querySelector(this.selectors.deletaAllButton)
        // Zugriff auf den Container der Aufgabenliste
        this.listElement = document.querySelector(this.selectors.list)
        // Zugriff auf den Container für leere Zustandsmeldungen
        this.emptyElement = document.querySelector(this.selectors.empty)

        /**
         * Zustand der Anwendung, enthält die Aufgabenliste, gefilterte Aufgaben und die Suchanfrage.
         */
        this.state = {
            items: this.getItemsFromLocalStorage(), // Aufgaben aus LocalStorage laden
            filteredItems: null, // Gefilterte Aufgaben (bei Suche)
            searchQuery: '', // Aktuelle Suchanfrage
        }

        // Initiales Rendern der Benutzeroberfläche
        this.render()
    }

    /**
     * Lädt die Aufgaben aus dem LocalStorage.
     * @returns {Array} Array von Aufgaben oder leeres Array bei Fehler oder fehlenden Daten.
     */
    getItemsFromLocalStorage() {
        // Rohdaten aus dem LocalStorage abrufen
        const rawData = localStorage.getItem(this.localStorageKey)

        // Prüfen, ob Daten vorhanden sind
        if (!rawData) {
            return []
        }

        try {
            // JSON-Daten parsen
            const parsedData = JSON.parse(rawData)
            // Sicherstellen, dass die Daten ein Array sind
            return Array.isArray(parsedData) ? parsedData : []
        } catch {
            // Fehlerbehandlung bei ungültigem JSON
            console.error('ToDo items parse error')
            return []
        }
    }

    /**
     * Speichert die aktuellen Aufgaben im LocalStorage.
     */
    saveItemsToLocalStorage() {
        // Aufgaben als JSON-String speichern
        localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.state.items)
        )
    }

    /**
     * Rendert die Benutzeroberfläche basierend auf dem aktuellen Zustand.
     */
    render() {
        // Gesamtzahl der Aufgaben anzeigen
        this.totalTasksElement.textContent = this.state.items.length

        // Sichtbarkeit des "Alle löschen"-Buttons basierend auf der Anzahl der Aufgaben umschalten
        this.deletaAllButtonElement.classList.toggle(
            this.stateClasses.isVisible,
            this.state.items.length > 0
        )

        // Entweder gefilterte oder alle Aufgaben rendern
        const items = this.state.filteredItems ?? this.state.items

        // Aufgabenliste als HTML generieren
        this.listElement.innerHTML = items.map(({ id, title, isChecked }) => `
            <li class="todo__item todo-item" data-js-todo-item>
                <input
                    class="todo-item__checkbox"
                    id="${id}"
                    type="checkbox"
                    ${isChecked ? 'checked' : ''}
                    data-js-todo-item-checkbox />
                <label for="${id}"
                    class="todo-item__label"
                    data-js-todo-item-label>
                    ${title}
                </label>
                <button class="todo-item__delete-button"
                    type="button"
                    aria-label="Delete"
                    title="Delete" 
                    data-js-todo-item-delete-button>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 1L1 11M1 1L11 11" stroke="#0D2471" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </li> 
        `).join('')

        // Prüfen, ob gefilterte oder alle Aufgaben leer sind
        const isEmptyFilteredItems = this.state.filteredItems?.length === 0
        const isEmptyItems = this.state.items.length === 0

        // Nachricht für leere Zustände anzeigen
        this.emptyElement.innerHTML = isEmptyFilteredItems
            ? `
                Aufgaben nicht gefunden
                <img src="../../public/images/empty.svg" alt="No tasks" />
              `
            : isEmptyItems
                ? `
                Es gibt noch keine Aufgaben
                <img src="../../public/images/empty.svg" alt="No tasks" />
              `
                : ''
    }

    /**
     * Fügt eine neue Aufgabe zur Liste hinzu.
     * @param {string} title - Titel der neuen Aufgabe.
     */
    addItem(title) {
        // Neue Aufgabe mit eindeutiger ID erstellen
        this.state.items.push({
            id: crypto?.randomUUID() ?? Date.now().toString(), // Fallback auf Timestamp, falls crypto nicht verfügbar
            title,
            isChecked: false
        })
        // Aufgaben im LocalStorage speichern
        this.saveItemsToLocalStorage()
        // UI neu rendern
        this.render()
    }

    deleteItem(id) {
        // Aufgabe aus der Liste entfernen
        this.state.items = this.state.items.filter((item) => item.id !== id)
        this.saveItemsToLocalStorage()
        this.render()
    }

    /**
     * Umschalten des Checked-Status einer Aufgabe (Platzhalter, noch nicht implementiert).
     */
    toggleCheckedState() { }
}

/**
 * Instanz der ToDo-Klasse erstellen und Anwendung initialisieren.
 */

new ToDo()