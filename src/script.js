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
        searchTaskInput: '[data-js-todo-search-task-input]', // Eingabefeld für die Suche
        totalTasks: '[data-js-todo-total-tasks]', // Anzeige der Gesamtzahl der Aufgaben
        deleteAllButton: '[data-js-todo-delete-all-button]', // Button zum Löschen aller Aufgaben
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
        this.searchTaskFormElement = this.rootElement.querySelector(this.selectors.searchTaskForm)
        // Zugriff auf das Eingabefeld für die Suche
        this.searchTaskInputElement = this.rootElement.querySelector(this.selectors.searchTaskInput)
        // Zugriff auf das Element, das die Gesamtzahl der Aufgaben anzeigt
        this.totalTasksElement = this.rootElement.querySelector(this.selectors.totalTasks)
        // Zugriff auf den Button zum Löschen aller Aufgaben
        this.deleteAllButtonElement = this.rootElement.querySelector(this.selectors.deleteAllButton)
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
        this.bindEvents()
    }

    /**
     * Lädt die Aufgaben aus dem LocalStorage.
     * returns {Array} Array von Aufgaben oder leeres Array bei Fehler oder fehlenden Daten.
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
        this.deleteAllButtonElement.classList.toggle(
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
     * param {string} title - Titel der neuen Aufgabe.
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

    

    /**
     * Löscht eine Aufgabe anhand ihrer ID.
     * param {string} id - ID der zu löschenden Aufgabe.
     */
    deleteItem(id) {
        // Aufgabe aus der Liste entfernen
        this.state.items = this.state.items.filter((item) => item.id !== id)
    
        this.saveItemsToLocalStorage()
        this.render()
    }

     /**
     * Schaltet den Checked-Status einer Aufgabe um.
     * param {string} id - ID der Aufgabe, deren Status geändert werden soll.
     */
    toggleCheckedState(id) {
        // Aktualisiert den isChecked-Status der Aufgabe mit der gegebenen ID
        this.state.items = this.state.items.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    isChecked: !item.isChecked
                }
            }
            return item
        })
    
        this.saveItemsToLocalStorage()
        this.render()
    }


    /**
     * Filtert die Aufgaben basierend auf der aktuellen Suchanfrage.
     */
    filter() {
        // Suchanfrage in Kleinbuchstaben formatieren
        const queryFormatted = this.state.searchQuery.toLowerCase()

        // Aufgaben filtern, deren Titel die Suchanfrage enthalten
        this.state.filteredItems = this.state.items.filter(({ title }) => {
            const titleFormatted = title.toLowerCase()
            return titleFormatted.includes(queryFormatted)
        })
   
        this.render()
    }

    /**
     * Setzt den Filter zurück und zeigt alle Aufgaben an.
     */
    resetFilter() {
        // Gefilterte Aufgaben und Suchanfrage zurücksetzen
        this.state.filteredItems = null
        this.state.searchQuery = ''
  
        this.render()
    }

    /**
     * Verarbeitet das Absenden des Formulars für neue Aufgaben.
     * param {Event} event - Submit-Ereignis des Formulars.
     */
    onNewTaskFormSubmit = (event) => {
        // Verhindert das Standardverhalten des Formulars (Seitenneuladen)
        event.preventDefault()

        // Titel der neuen Aufgabe aus dem Eingabefeld holen
        const newTodoItemTitle = this.newTaskInputElement.value

        // Prüfen, ob der Titel nicht leer ist
        if (newTodoItemTitle.trim().length > 0) {
            // Neue Aufgabe hinzufügen
            this.addItem(newTodoItemTitle)
            // Filter zurücksetzen
            this.resetFilter()
            // Eingabefeld leeren
            this.newTaskInputElement.value = ''
            // Fokus auf das Eingabefeld setzen
            this.newTaskInputElement.focus()
        }
    }

    /**
     * Verarbeitet das Absenden des Suchformulars (keine Aktion, nur PreventDefault).
     * param {Event} event - Submit-Ereignis des Suchformulars.
     */
    onSearchTaskFormSubmit = (event) => {
        // Verhindert das Standardverhalten des Formulars (Seitenneuladen)
        event.preventDefault()
    }

    /**
     * Verarbeitet Änderungen im Such-Eingabefeld.
     * param {Event} event - Input-Ereignis des Suchfelds.
     */
    onSearchTaskInputChange = ({ target }) => {
        // Wert des Eingabefelds bereinigen
        const value = target.value.trim()

        // Prüfen, ob ein Suchbegriff vorhanden ist
        if (value.length > 0) {
            // Suchanfrage speichern und filtern
            this.state.searchQuery = value
            this.filter()
        } else {
         
            this.resetFilter()
        }
    }

   /**
     * Verarbeitet den Klick auf den "Alle löschen"-Button.
     */
    onDeleteAllButtonClick = () => {
        // Bestätigungsdialog anzeigen
        const isConfirmed = confirm('Bist du sicher, dass du alles löschen willst?')

        // Wenn bestätigt, alle Aufgaben löschen
        if (isConfirmed) {
            this.state.items = []
       
            this.saveItemsToLocalStorage()
            this.render()
        }
    }


    /**
     * Verarbeitet Klick-Ereignisse in der Aufgabenliste.
     * param {Event} event - Klick-Ereignis.
     */
    onClick = ({ target }) => {
        // Prüfen, ob der Lösch-Button geklickt wurde
        if (target.matches(this.selectors.itemDeleteButton)) {
            // Nächstes Listenelement finden
            const itemElement = target.closest(this.selectors.item)
            // Checkbox des Elements finden
            const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox)

            // Animation für das Verschwinden hinzufügen
            itemElement.classList.add(this.stateClasses.isDisappearing)

            // Aufgabe nach Ablauf der Animation löschen
            setTimeout(() => {
                this.deleteItem(itemCheckboxElement.id)
            }, 400)
        }
    }



   /**
     * Verarbeitet Änderungen an Checkboxen in der Aufgabenliste.
     * param {Event} event - Change-Ereignis.
     */
    onChange = ({ target }) => {
        // Prüfen, ob eine Checkbox geändert wurde
        if (target.matches(this.selectors.itemCheckbox)) {
            // Checked-Status der Aufgabe umschalten
            this.toggleCheckedState(target.id)
        }
    }


     bindEvents() {
        // Submit-Ereignis für das Formular zum Hinzufügen neuer Aufgaben
        this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit)
        // Submit-Ereignis für das Suchformular
        this.searchTaskFormElement.addEventListener('submit', this.onSearchTaskFormSubmit)
        // Input-Ereignis für das Such-Eingabefeld
        this.searchTaskInputElement.addEventListener('input', this.onSearchTaskInputChange)
        // Click-Ereignis für den "Alle löschen"-Button
        this.deleteAllButtonElement.addEventListener('click', this.onDeleteAllButtonClick)
        // Click-Ereignis für die Aufgabenliste
        this.listElement.addEventListener('click', this.onClick)
        // Change-Ereignis für Checkboxen in der Aufgabenliste
        this.listElement.addEventListener('change', this.onChange)
    }
}


//Instanz der ToDo-Klasse erstellen und Anwendung initialisieren.

new ToDo()