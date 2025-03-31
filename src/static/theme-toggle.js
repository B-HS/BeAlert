const toggleBtn = document.getElementById('theme-toggle')
const root = document.documentElement
const lightIcon = document.getElementById('light-icon')
const darkIcon = document.getElementById('dark-icon')
const metaThemeColor = document.querySelector("meta[name='theme-color']")

document.addEventListener('DOMContentLoaded', () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const theme = e.matches ? 'dark' : 'light'
        if (!localStorage.getItem('theme')) {
            setTheme(theme)
        }
    })

    const updateIcons = (theme) => {
        if (theme === 'dark') {
            lightIcon.style.display = 'block'
            darkIcon.style.display = 'none'
        } else {
            lightIcon.style.display = 'none'
            darkIcon.style.display = 'block'
        }
    }

    const setTheme = (theme) => {
        if (theme === 'dark') {
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            metaThemeColor.setAttribute('content', '#000000')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            metaThemeColor.setAttribute('content', '#ffffff')
        }
        updateIcons(theme)
    }

    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(savedTheme)

    toggleBtn.addEventListener('click', () => {
        const currentTheme = root.classList.contains('dark') ? 'dark' : 'light'
        setTheme(currentTheme === 'dark' ? 'light' : 'dark')
    })
})
