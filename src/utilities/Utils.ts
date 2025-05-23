export class Utils {
    static generateUniqueId() {
        const timePart = Date.now().toString(36);
        const randomArray = new Uint32Array(1);
        window.crypto.getRandomValues(randomArray);
        const randomPart = randomArray[0].toString(36);
        return timePart + randomPart;
    }

    static rgbToHex(rgb: string): string {
        const rgbArray = rgb.match(/\d+/g)!.map(Number);
        return "#" + rgbArray.map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    static isEventFromContentWrapper(event: Event): boolean {
        const target = event.target;
        const contentWrapper = document.querySelector('#johannesEditor .content-wrapper');

        if (!contentWrapper || !target) {
            return false;
        }

        if (!(target instanceof Node)) {
            return false;
        }

        return contentWrapper.contains(target);
    }

    static isValidUrl(url: string): boolean {
        const pattern = new RegExp(
            '^https?:\\/\\/' +
            '(([^:@\\s]+)(:[^@\\s]*)?@)?' +
            '(?!-)[a-zA-Z\\d-]{1,63}(?<!-)\\.' +
            '([a-zA-Z\\d-]+\\.)*' +
            '[a-zA-Z]{2,}' +
            '(\\:\\d{1,5})?' +
            '(\\/[-a-zA-Z\\d%_.~+@]*)*' +
            '(\\?[-a-zA-Z\\d%_.~+=&]*)?' +
            '(#[-a-zA-Z\\d_]*)?$',
            'i'
        );
        const lowered = url.toLowerCase();
        if (lowered.includes('../') || lowered.includes('%2e%2e') || lowered.includes('%00')) {
            return false;
        }
    
        if (!pattern.test(url)) return false;
    
        try {
            const parsed = new URL(url);
            if (parsed.port) {
                const port = parseInt(parsed.port, 10);
                if (port < 1 || port > 65535) return false;
            }
        } catch {
            return false;
        }
        return true;
    }
}