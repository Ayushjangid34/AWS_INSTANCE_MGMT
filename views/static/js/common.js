// Navbar mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

//func for logout button
function logout(event) {
  event.preventDefault();

  fetch('/auth/logout', {
    method: 'POST'
  }).then(response => {
    if (response.ok) {
      // Show toast first
      showSuccessToast('Logged out successfully');

      // Redirect after 2 seconds (2000 milliseconds)
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
    } else {
      showErrorToast('Logout failed. Please try again.');
    }
  }).catch(() => {
    showErrorToast('Network error. Please try again.');
  });
}


// Success toast
function showSuccessToast(message, duration = 3000) {
  Toastify({
    text: message,
    duration,
    gravity: "top",
    position: "center",
    backgroundColor: "green",
    stopOnFocus: true
  }).showToast();
}

// Error toast
function showErrorToast(message, duration = 3000) {
  Toastify({
    text: message,
    duration,
    gravity: "top",
    position: "center",
    backgroundColor: "red",
    stopOnFocus: true
  }).showToast();
}
