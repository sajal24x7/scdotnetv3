const DEFAULT_MAIN_SECTION = 'garden';

type SectionMapping = {
    main: string;
    subsection?: string;
};

const categoryMappings: Record<string, SectionMapping> = {
    about: { main: 'about' },
    sajal: { main: 'about', subsection: '/sajal/' },
    colophon: { main: 'about', subsection: '/colophon/' },
    now: { main: 'about', subsection: '/now/' },
    feeds: { main: 'about', subsection: '/feeds/' },
    then: { main: 'about', subsection: '/then/' },
    garden: { main: 'garden' },
    evergreen: { main: 'garden', subsection: '/evergreen/' },
    til: { main: 'garden', subsection: '/til/' },
    shelf: { main: 'shelf' },
    bookshelf: { main: 'shelf', subsection: '/bookshelf/' },
    filmshelf: { main: 'shelf', subsection: '/filmshelf/' },
    tvshelf: { main: 'shelf', subsection: '/tvshelf/' },
    gameshelf: { main: 'shelf', subsection: '/gameshelf/' },
    stories: { main: 'garden', subsection: '/stories/' },
    story: { main: 'garden', subsection: '/stories/' },
    poems: { main: 'garden', subsection: '/poems/' },
    poem: { main: 'garden', subsection: '/poems/' },
    stream: { main: 'stream' },
    blog: { main: 'stream', subsection: '/blog/' },
    micro: { main: 'stream', subsection: '/micro/' },
    photo: { main: 'stream', subsection: '/photos/' },
    photos: { main: 'stream', subsection: '/photos/' }
};

function splitClasses(value?: string): string[] {
    return value ? value.split(/\s+/).filter(Boolean) : [];
}

function applyActiveState(element: HTMLElement, isActive: boolean) {
    const activeClasses = splitClasses(element.dataset.activeClass);
    const inactiveClasses = splitClasses(element.dataset.inactiveClass);

    const classesToRemove = isActive ? inactiveClasses : activeClasses;
    const classesToAdd = isActive ? activeClasses : inactiveClasses;

    classesToRemove.forEach((className) => {
        if (className) {
            element.classList.remove(className);
        }
    });

    classesToAdd.forEach((className) => {
        if (className) {
            element.classList.add(className);
        }
    });

    element.dataset.state = isActive ? 'active' : 'inactive';
}

class MultiLevelNavigationElement extends HTMLElement {
    private handlePopState = () => {
        this.applyQueryCategory();
    };

    connectedCallback() {
        this.applyQueryCategory();
        window.addEventListener('popstate', this.handlePopState);
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.handlePopState);
    }

    private applyQueryCategory() {
        if (typeof window === 'undefined') {
            return;
        }

        if (!window.location.pathname.startsWith('/tags/')) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const rawCategory = params.get('category');
        if (!rawCategory) {
            return;
        }

        const normalizedCategory = rawCategory.toLowerCase();
        const mapping = categoryMappings[normalizedCategory];
        const mainSection = mapping?.main ?? DEFAULT_MAIN_SECTION;
        const subsection = mapping?.subsection ?? null;

        this.dataset.activeMain = mainSection;
        this.dataset.activeSubsection = subsection ?? '';

        this.updateMainLinks(mainSection);
        this.updateSecondaryNavigation(mainSection, subsection);
    }

    private updateMainLinks(targetMain: string) {
        const mainLinks = this.querySelectorAll<HTMLElement>('[data-main-key]');
        mainLinks.forEach((link) => {
            const linkMain = link.dataset.mainKey ?? '';
            applyActiveState(link, linkMain === targetMain);
        });
    }

    private updateSecondaryNavigation(targetMain: string, targetSubsection: string | null) {
        const secondaryNavs = this.querySelectorAll<HTMLElement>('[data-secondary-nav]');
        secondaryNavs.forEach((nav) => {
            const section = nav.dataset.section ?? '';
            const isTargetSection = section === targetMain;
            nav.toggleAttribute('hidden', !isTargetSection);
            this.updateSecondaryLinks(nav, isTargetSection ? targetSubsection : null);
        });
    }

    private updateSecondaryLinks(nav: HTMLElement, targetSubsection: string | null) {
        const links = nav.querySelectorAll<HTMLElement>('[data-secondary-href]');
        links.forEach((link) => {
            const href = link.dataset.secondaryHref ?? '';
            applyActiveState(link, !!targetSubsection && href === targetSubsection);
        });
    }

}

if (!customElements.get('multi-level-navigation')) {
    customElements.define('multi-level-navigation', MultiLevelNavigationElement);
}
