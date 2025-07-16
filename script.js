// ==============================================
// DOM ELEMENT SELECTORS
// ==============================================
// Get all form input elements and error message containers
const studentForm = document.getElementById('studentForm'); // Main form element
const nameInput = document.getElementById('name'); // Student name input
const idInput = document.getElementById('id'); // Student ID input
const emailInput = document.getElementById('email'); // Email input
const contactInput = document.getElementById('contact'); // Contact number input
const classInput = document.getElementById('class'); // Class input
const addressInput = document.getElementById('address'); // Address textarea

// Form action buttons
const submitBtn = document.getElementById('submitBtn'); // Submit button
const updateBtn = document.getElementById('updateBtn'); // Update button (hidden initially)
const cancelBtn = document.getElementById('cancelBtn'); // Cancel button (hidden initially)

// Table and search elements
const studentTableBody = document.getElementById('studentTableBody'); // Table body for student records
const searchInput = document.getElementById('searchInput'); // Search input field

// Error message display elements
const nameError = document.getElementById('nameError'); // Name validation error
const idError = document.getElementById('idError'); // ID validation error
const emailError = document.getElementById('emailError'); // Email validation error
const contactError = document.getElementById('contactError'); // Contact validation error
const classError = document.getElementById('classError'); // Class validation error

// ==============================================
// APPLICATION STATE VARIABLES
// ==============================================
let students = JSON.parse(localStorage.getItem('students')) || []; // Load students from localStorage or initialize empty array
let editId = null; // Tracks which student is being edited (null means no edit in progress)

// ==============================================
// INITIALIZATION FUNCTION
// ==============================================
/**
 * Initializes the application by:
 * 1. Rendering the student table
 * 2. Setting up all event listeners
 */
function init() {
    renderStudentTable(); // Display existing students
    setupEventListeners(); // Attach all event handlers
}

// ==============================================
// EVENT LISTENER SETUP
// ==============================================
/**
 * Sets up all event listeners for the application:
 * - Form submission
 * - Button clicks
 * - Search input
 * - Field validations
 */
function setupEventListeners() {
    // Form submission handler
    studentForm.addEventListener('submit', handleFormSubmit);
    
    // Button click handlers
    updateBtn.addEventListener('click', handleUpdate);
    cancelBtn.addEventListener('click', resetForm);
    
    // Real-time search filtering
    searchInput.addEventListener('input', handleSearch);
    
    // Input validation handlers (triggered on input changes)
    nameInput.addEventListener('input', validateName);
    idInput.addEventListener('input', validateId);
    emailInput.addEventListener('input', validateEmail);
    contactInput.addEventListener('input', validateContact);
    classInput.addEventListener('input', validateClass);
}

// ==============================================
// FORM HANDLING FUNCTIONS
// ==============================================
/**
 * Handles form submission for new student registration
 * @param {Event} e - The form submission event
 */
function handleFormSubmit(e) {
    e.preventDefault(); // Prevent default form submission
    
    // Validate all fields before proceeding
    if (!validateForm()) return;
    
    // Create student object from form data
    const student = {
        name: nameInput.value.trim(),
        id: idInput.value.trim(),
        email: emailInput.value.trim(),
        contact: contactInput.value.trim(),
        class: classInput.value.trim(),
        address: addressInput.value.trim()
    };
    
    // Add new student to array and update UI/storage
    students.push(student);
    saveToLocalStorage();
    renderStudentTable();
    resetForm();
}

/**
 * Handles updating an existing student record
 */
function handleUpdate() {
    // Validate all fields before proceeding
    if (!validateForm()) return;
    
    // Create updated student object
    const student = {
        name: nameInput.value.trim(),
        id: idInput.value.trim(),
        email: emailInput.value.trim(),
        contact: contactInput.value.trim(),
        class: classInput.value.trim(),
        address: addressInput.value.trim()
    };
    
    // Update the student in the array and refresh UI
    students[editId] = student;
    saveToLocalStorage();
    renderStudentTable();
    resetForm();
}

/**
 * Resets the form to its initial state:
 * - Clears all fields
 * - Hides update/cancel buttons
 * - Shows submit button
 * - Clears error messages
 * - Resets edit mode
 */
function resetForm() {
    studentForm.reset(); // Reset all form fields
    editId = null; // Exit edit mode
    
    // Reset button visibility
    submitBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    clearErrorMessages(); // Clear any validation errors
}

// ==============================================
// CRUD OPERATIONS (Create, Read, Update, Delete)
// ==============================================
/**
 * Loads a student's data into the form for editing
 * @param {number} index - The index of the student in the students array
 */
function editStudent(index) {
    const student = students[index]; // Get student to edit
    editId = index; // Store which student we're editing
    
    // Populate form fields with student data
    nameInput.value = student.name;
    idInput.value = student.id;
    emailInput.value = student.email;
    contactInput.value = student.contact;
    classInput.value = student.class;
    addressInput.value = student.address;
    
    // Switch to edit mode UI
    submitBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
}

/**
 * Deletes a student record after confirmation
 * @param {number} index - The index of the student to delete
 */
function deleteStudent(index) {
    // Confirm deletion with user
    if (confirm('Are you sure you want to delete this student?')) {
        students.splice(index, 1); // Remove student from array
        saveToLocalStorage(); // Update storage
        renderStudentTable(); // Refresh UI
        
        // If we were editing the deleted student, reset the form
        if (editId === index) {
            resetForm();
        }
    }
}

// ==============================================
// SEARCH FUNCTIONALITY
// ==============================================
/**
 * Filters student records based on search input
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    // Filter students where any field contains the search term
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) || 
        student.id.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.contact.toLowerCase().includes(searchTerm) ||
        student.class.toLowerCase().includes(searchTerm)
    );
    
    // Display filtered results
    renderStudentTable(filteredStudents);
}

// ==============================================
// RENDERING FUNCTIONS
// ==============================================
/**
 * Renders the student table with either all students or filtered subset
 * @param {Array} [data=students] - The students data to display (defaults to all students)
 */
function renderStudentTable(data = students) {
    studentTableBody.innerHTML = ''; // Clear current table content
    
    // Handle empty state
    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="no-records">No student records found</td>`;
        studentTableBody.appendChild(row);
        return;
    }
    
    // Create a row for each student
    data.forEach((student, index) => {
        const row = document.createElement('tr');
        
        // Populate row with student data and action buttons
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.email}</td>
            <td>${student.contact}</td>
            <td>${student.class}</td>
            <td>${student.address}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editStudent(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteStudent(${index})">Delete</button>
            </td>
        `;
        
        studentTableBody.appendChild(row); // Add row to table
    });
}

// ==============================================
// DATA PERSISTENCE
// ==============================================
/**
 * Saves the current students array to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

// ==============================================
// VALIDATION FUNCTIONS
// ==============================================
/**
 * Validates all form fields
 * @returns {boolean} True if all fields are valid, false otherwise
 */
function validateForm() {
    let isValid = true;
    
    // Validate each field and track overall validity
    if (!validateName()) isValid = false;
    if (!validateId()) isValid = false;
    if (!validateEmail()) isValid = false;
    if (!validateContact()) isValid = false;
    if (!validateClass()) isValid = false;
    
    return isValid;
}

/**
 * Validates the name field:
 * - Must not be empty
 * - Must contain only letters and spaces
 */
function validateName() {
    const name = nameInput.value.trim();
    const nameRegex = /^[a-zA-Z\s]+$/;
    
    if (!name) {
        nameError.textContent = 'Name is required';
        return false;
    }
    
    if (!nameRegex.test(name)) {
        nameError.textContent = 'Name can only contain letters and spaces';
        return false;
    }
    
    nameError.textContent = '';
    return true;
}

/**
 * Validates the student ID field:
 * - Must not be empty
 * - Must contain only numbers
 * - Must be unique (when adding new student)
 */
function validateId() {
    const id = idInput.value.trim();
    
    if (!id) {
        idError.textContent = 'Student ID is required';
        return false;
    }
    
    if (!/^\d+$/.test(id)) {
        idError.textContent = 'Student ID must contain only numbers';
        return false;
    }
    
    // Check for duplicate ID when adding new student
    if (editId === null && students.some(student => student.id === id)) {
        idError.textContent = 'Student ID already exists';
        return false;
    }
    
    // Check for duplicate ID when editing (excluding current student)
    if (editId !== null && students.some((student, index) => student.id === id && index !== editId)) {
        idError.textContent = 'Student ID already exists';
        return false;
    }
    
    idError.textContent = '';
    return true;
}

/**
 * Validates the email field:
 * - Must not be empty
 * - Must be in valid email format
 */
function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        emailError.textContent = 'Email is required';
        return false;
    }
    
    if (!emailRegex.test(email)) {
        emailError.textContent = 'Please enter a valid email address';
        return false;
    }
    
    emailError.textContent = '';
    return true;
}

/**
 * Validates the contact number field:
 * - Must not be empty
 * - Must contain only numbers
 * - Must be 10-15 digits long
 */
function validateContact() {
    const contact = contactInput.value.trim();
    
    if (!contact) {
        contactError.textContent = 'Contact number is required';
        return false;
    }
    
    if (!/^\d+$/.test(contact)) {
        contactError.textContent = 'Contact number must contain only numbers';
        return false;
    }
    
    if (contact.length < 10 || contact.length > 15) {
        contactError.textContent = 'Contact number must be between 10-15 digits';
        return false;
    }
    
    contactError.textContent = '';
    return true;
}

/**
 * Validates the class field:
 * - Must not be empty
 */
function validateClass() {
    const className = classInput.value.trim();
    
    if (!className) {
        classError.textContent = 'Class is required';
        return false;
    }
    
    classError.textContent = '';
    return true;
}

/**
 * Clears all error messages from the form
 */
function clearErrorMessages() {
    nameError.textContent = '';
    idError.textContent = '';
    emailError.textContent = '';
    contactError.textContent = '';
    classError.textContent = '';
}

// ==============================================
// START THE APPLICATION
// ==============================================
init(); // Initialize the application when script loads