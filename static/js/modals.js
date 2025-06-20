// Simple modal handling
document.addEventListener('DOMContentLoaded', () => {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    
    // Close modal function
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    // Open modal function
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }
    
    // Close all modals
    function closeAllModals() {
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close buttons
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Expose functions globally
    window.modalFunctions = {
        open: openModal,
        close: closeModal,
        closeAll: closeAllModals
    };
});