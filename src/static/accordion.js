const initAccordion = () => {
    const accordionTriggers = document.querySelectorAll('.accordion-trigger')

    accordionTriggers.forEach((trigger) => {
        let isTransitioning = false

        trigger.addEventListener('click', () => {
            if (isTransitioning) return
            isTransitioning = true

            const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
            const contentId = trigger.getAttribute('aria-controls')
            const content = document.getElementById(contentId)

            trigger.setAttribute('aria-expanded', !isExpanded)

            if (isExpanded) {
                content.style.maxHeight = content.scrollHeight + 'px'
                requestAnimationFrame(() => {
                    content.style.maxHeight = '0'
                })

                content.addEventListener(
                    'transitionend',
                    () => {
                        content.setAttribute('hidden', '')
                        isTransitioning = false
                    },
                    { once: true },
                )
                trigger.querySelector('.accordion-chevron').classList.remove('rotate-180')
            } else {
                content.removeAttribute('hidden')
                const scrollHeight = content.scrollHeight
                content.style.maxHeight = '0'

                requestAnimationFrame(() => {
                    content.style.maxHeight = scrollHeight + 'px'
                })

                content.addEventListener(
                    'transitionend',
                    () => {
                        content.style.maxHeight = 'none'
                        isTransitioning = false
                    },
                    { once: true },
                )

                trigger.querySelector('.accordion-chevron').classList.add('rotate-180')
            }
        })

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                trigger.click()
            }
        })
    })
}

document.addEventListener('DOMContentLoaded', initAccordion)
