// Testimonials: click an avatar to show that review
(function () {
    const avatars = document.querySelectorAll('.avatars .avatar');
    const photo = document.querySelector('[data-review-photo]');
    const name = document.querySelector('[data-review-name]');
    const role = document.querySelector('[data-review-role]');
    const text = document.querySelector('[data-review-text]');
    avatars.forEach(a => a.addEventListener('click', () => {
        avatars.forEach(x => x.classList.toggle('active', x === a));
        photo.src = a.dataset.photo;
        name.textContent = a.dataset.name;
        role.textContent = a.dataset.role;
        text.textContent = a.dataset.text;
    }));
})();
