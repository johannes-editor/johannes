import { BaseUIComponent } from "./BaseUIComponent";

export class SVGIcon extends BaseUIComponent {

    useElement: SVGUseElement;

    constructor(iconId: string, size: string) {

        super({
            iconId: iconId,
            size: size
        })

        this.useElement = this.htmlElement.querySelector('use') as SVGUseElement;
    }

    init(): HTMLElement {

        const htmlElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${this.props.iconId}`);

        htmlElement.appendChild(use);
        htmlElement.setAttribute('width', this.props.size);
        htmlElement.setAttribute('height', this.props.size);
        htmlElement.setAttribute('fill', 'currentColor');

        return htmlElement as unknown as HTMLElement;
    }

    clone(): SVGIcon {
        return new SVGIcon(this.props.iconId, this.props.sizes);
    }

    setUseTo(value: string): void {
        this.useElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${value}`);
    }

    static create(iconId: string, size: string): SVGIcon {
        return new SVGIcon(iconId, size);
    }
}