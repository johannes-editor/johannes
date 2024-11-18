import { BaseUIComponent } from "../common/BaseUIComponent";
import { IFocusStack } from "@/core/IFocusStack";
import { DependencyContainer } from "@/core/DependencyContainer";
import { ZIndex } from "@/common/ZIndex";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { DOMUtils } from "@/utilities/DOMUtils";
import { EmbedTool, EmbedTypes } from "@/core/EmbedTool";
import { CommonClasses } from "@/common/CommonClasses";
import { ContentTypes } from "@/common/ContentTypes";
import { Utils } from "@/utilities/Utils";
import { CustomEvents } from "@/common/CustomEvents";
import { ICommandEventDetail } from "@/commands/ICommandEventDetail";
import { Commands } from "@/commands/Commands";

export class MediaInputter extends BaseUIComponent {

    id: string;
    focusStack: IFocusStack;

    constructor() {
        const id = "mediaInputter";
        super({
            id: id
        });

        this.id = id;
        this.focusStack = DependencyContainer.Instance.resolve<IFocusStack>("IFocusStack");

        this.attachEvents();
    }

    init(): HTMLElement {
        const htmlElement = document.createElement("div");
        htmlElement.id = this.props.id;
        htmlElement.classList.add("tab-container", "soft-box-shadow");
        htmlElement.style.display = "none";
        htmlElement.style.zIndex = ZIndex.ExtremelyImportant;

        const head = document.createElement("ul");
        head.classList.add("nav", "nav-underline");

        const uploadTab = this.createNavItem("uploadTab", "Upload", true);

        const embedTab = this.createNavItem("embedTab", "Embed");

        head.appendChild(uploadTab);
        head.appendChild(embedTab);

        const content = document.createElement("div");
        content.classList.add("tab-content");

        const uploadContent = this.createUploadContent();
        const embedContent = this.createEmbedContent();

        content.appendChild(uploadContent);
        content.appendChild(embedContent);

        htmlElement.appendChild(head);
        htmlElement.appendChild(content);

        return htmlElement;
    }

    createNavItem(id: string, text: string, active: boolean = false): HTMLElement {
        const li = document.createElement("li");
        li.classList.add("nav-item");
        li.id = id;

        const a = document.createElement("a");
        a.classList.add("nav-link-item");
        a.innerText = text;
        li.appendChild(a);

        return li;
    }

    createUploadContent(): HTMLElement {
        const div = document.createElement("div");
        div.id = "uploadContent";
        div.classList.add("upload-content", "content-data");

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.id = "fileInput";
        input.style.display = "block";

        const label = document.createElement("label");
        label.classList.add("blue-button");
        label.htmlFor = input.id;
        label.innerText = "Upload file";

        label.addEventListener("click", () => {
            input.click();
        });

        const textInfo = document.createElement("div");
        textInfo.classList.add("text-information");
        textInfo.innerText = "Maximum file size: 5MB";

        div.appendChild(input);
        div.appendChild(textInfo);

        input.addEventListener("change", (event) => this.uploadImage(event));

        return div;
    }

    async uploadImage(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const src = e.target!.result as string;

                const img = new Image();
                img.onload = async () => {

                    const width: number = img.naturalWidth;
                    const height: number = img.naturalHeight;

                    const focusedElement = this.focusStack.peek();
                    if (focusedElement) {
                        await EmbedTool.embedImage(src, focusedElement, width, height);
                        this.hide();

                        const imageUploadEvent = new CustomEvent('imageUploaded', {
                            detail: {
                                file: file
                            }
                        });
                        document.dispatchEvent(imageUploadEvent);
                    }
                };

                img.src = src;
            };
            reader.readAsDataURL(file);
        }
    }

    createEmbedContent(): HTMLElement {
        const div = document.createElement("div");
        div.id = "embedContent";
        div.classList.add("content-data", "embed-content");

        const input = document.createElement("input");
        input.type = "text";

        const button = document.createElement("button");
        button.classList.add("blue-button");
        button.innerText = "Embed";

        div.appendChild(input);
        div.appendChild(button);

        button.addEventListener(DefaultJSEvents.Click, () => this.embedGeneric(input));

        input.addEventListener(DefaultJSEvents.Keydown, (event: KeyboardEvent) => {
            if (event.key == KeyboardKeys.Enter) {
                event.preventDefault();
                event.stopImmediatePropagation();

                this.embedGeneric(input);
            }
        });

        input.addEventListener(DefaultJSEvents.Focusin, () => this.resetInputBgColor(input));

        return div;
    }

    resetInputBgColor(input: HTMLInputElement) {
        input.style.backgroundColor = "";
    }

    async embedGeneric(input: HTMLInputElement): Promise<void> {

        const stringURL = input.value;
        const focusedElement = this.focusStack.peek();
        const contentType = focusedElement?.closest(`.${CommonClasses.ContentElement}`)?.getAttribute("data-content-type");

        try {
            const url = new URL(stringURL);

            if (!Utils.isValidUrl(url.toString())) {
                throw new Error("Invalid URL");
            }

            if (!focusedElement) {
                console.error("not element found");
                return;
            }

            if (contentType == ContentTypes.Image) {
                await EmbedTool.embedImage(stringURL, focusedElement);
            } else if (contentType == ContentTypes.Iframe) {

                const embedType = EmbedTool.determineEmbedType(stringURL);

                switch (embedType) {

                    case EmbedTypes.YouTubeVideo:
                        EmbedTool.embedYouTubeVideoAsIframe(MediaInputter.normalizeYouTubeUrl(url), focusedElement);
                        break;

                    case EmbedTypes.YouTubePlaylist:
                        EmbedTool.embedYouTubePlaylistAsIframe(MediaInputter.normalizeYouTubeUrl(url), focusedElement);
                        break;

                    case EmbedTypes.YouTubeShort:
                        EmbedTool.embedYouTubeShortAsIframe(MediaInputter.normalizeYouTubeUrl(url), focusedElement);
                        break;

                    case EmbedTypes.SpotifyTrack:
                        EmbedTool.embedSpotifyContent(url, focusedElement, embedType);
                        break;

                    case EmbedTypes.SpotifyPlaylist:
                        EmbedTool.embedSpotifyContent(url, focusedElement, embedType);
                        break;

                    case EmbedTypes.SpotifyArtist:
                        EmbedTool.embedSpotifyContent(url, focusedElement, embedType);
                        break;

                    case EmbedTypes.SpotifyEpisode:
                        EmbedTool.embedSpotifyContent(url, focusedElement, embedType);
                        break;

                    case EmbedTypes.SpotifyShow:
                        EmbedTool.embedSpotifyContent(url, focusedElement, embedType);
                        break;

                    case EmbedTypes.SpotifyPlaylist:
                        EmbedTool.embedSpotifyContent(url, focusedElement, embedType);
                        break;

                    case EmbedTypes.GitHubGist:
                        EmbedTool.embedGistAsScript(url, focusedElement);
                        break;

                    case EmbedTypes.CodePen:
                        EmbedTool.embedCodepenAsIframe(url, focusedElement);
                        break;
                    default:
                        throw new Error("Unsupported");
                }
            }

            const customEvent = new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                detail: {
                    command: Commands.createDefaultBlock
                }
            });

            document.dispatchEvent(customEvent);

            this.hide();

        } catch (error) {

            const input = document.querySelector("#embedContent input") as HTMLInputElement;
            if (input) {
                input.style.backgroundColor = "rgb(253, 222, 222)";
                input.classList.add("shake-animation");

                setTimeout(() => {
                    input.classList.remove("shake-animation");
                }, 1000);
            }
        }
    }

    static normalizeYouTubeUrl(urlObj: URL): URL {
        if (urlObj.hostname === 'youtu.be') {
            const newUrl = new URL('https://www.youtube.com/watch');
    
            const videoId = urlObj.pathname.substring(1);
    
            newUrl.searchParams.set('v', videoId);
    
            urlObj.searchParams.forEach((value, key) => {
                newUrl.searchParams.set(key, value);
            });
    
            return newUrl;
        }
    
        return new URL(urlObj.toString());
    }

    set inputValue(value: string) {
        const inputText = this.htmlElement.querySelector("input");
        if (inputText) {
            inputText.value = value;
        }
    }

    get display(): string {
        return "flex";
    }


    attachEvents(): void {

        const uploadTab = this.htmlElement.querySelector("#uploadTab");
        uploadTab?.addEventListener("click", () => {
            this.setActiveTab('uploadTab', 'uploadContent');
        });

        const embedTab = this.htmlElement.querySelector("#embedTab");
        embedTab?.addEventListener("click", () => {
            this.setActiveTab('embedTab', 'embedContent');
        });

        document.addEventListener(DefaultJSEvents.Keydown, this.handlerKeydownEvents.bind(this));
        document.addEventListener(DefaultJSEvents.Click, this.handlerClickEvents.bind(this));

        super.attachUIEvent();
    }

    handlerKeydownEvents(event: KeyboardEvent) {
        if (event.key == KeyboardKeys.Escape) {

            if(!Utils.isEventFromContentWrapper(event)){
                return;
            }
            
            if (this.canHide) {
                this.hide();
            }
        }
    }

    handlerClickEvents(event: MouseEvent) {
        // const embedImage = DOMUtils.findClickedElementOrAncestorById(event, "embedImage");
        // if (embedImage) {
        //     event.stopImmediatePropagation();
        //     const element = this.focusStack.peek();
        //     if (element) {
        //         this.embedImage(element);
        //     }
        // }

        this.hideMediaInputterOnExternalClick(event)
        this.showMediaInputterOnMediaInputterElementClick(event);
    }


    hideMediaInputterOnExternalClick(event: MouseEvent) {
        const mediaInputter = DOMUtils.findClickedElementOrAncestorById(event, this.id);
        const clickedOnElementWithShowMediaInputClass = DOMUtils.findClickedElementOrAncestorByClass(event, CommonClasses.ShowMediaInputOnClick);
        if (!mediaInputter && !clickedOnElementWithShowMediaInputClass && this.isVisible) {
            event.stopImmediatePropagation();
            this.hide();
            return;
        }
    }

    showMediaInputterOnMediaInputterElementClick(event: MouseEvent) {

        const clickedOnElementWithShowMediaInputClass = DOMUtils.findClickedElementOrAncestorByClass(event, CommonClasses.ShowMediaInputOnClick);
        if (clickedOnElementWithShowMediaInputClass) {
            event.stopImmediatePropagation();
            event.preventDefault();

            this.focusStack.push(clickedOnElementWithShowMediaInputClass);

            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }

            return;
        }

    }

    findClassWithSuffix(element: Element, suffix: string): string | null {
        const regex = new RegExp(`.*${suffix}$`);

        for (let className of element.classList) {
            if (regex.test(className)) {
                return className;
            }
        }

        return null;
    }


    getTab(tabId: string): HTMLElement | null {
        return document.getElementById(tabId);
    }

    getContent(contentId: string): HTMLElement | null {
        return document.getElementById(contentId);
    }

    setActiveTab(tabId: string, contentId: string) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.content-data').forEach(content => {
            content.classList.remove('active');

        });

        this.getTab(tabId)?.classList.add('active');

        const contentElement = this.getContent(contentId);

        if (contentElement) {
            contentElement.classList.add('active');

            const input = contentElement.querySelector("input");

            if (input) {
                input.style.backgroundColor = "white";

                setTimeout(() => {
                    input.focus();
                }, 100);
            }
        }
    }

    show(): void {

        const inp = document.querySelector("#embedContent input") as HTMLInputElement;

        if (inp) {
            inp.value = "";
        }

        const lastFocused = this.focusStack.peek();

        const showInputMedia = lastFocused?.querySelector(`.${CommonClasses.ShowMediaInputOnClick}`) || lastFocused?.closest(`.${CommonClasses.ShowMediaInputOnClick}`);

        if (showInputMedia) {
            const textPlaceholder = this.findClassWithSuffix(showInputMedia, "-embed-placeholder-text");

            if (textPlaceholder) {
                this.setInputPlaceholder(textPlaceholder);
            }
        }

        if (lastFocused) {

            const activateMediaUpload = lastFocused.querySelector(`.${CommonClasses.ShowMediaInputUpload}`) || lastFocused.closest(`.${CommonClasses.ShowMediaInputUpload}`);
            const uploadTab = this.htmlElement.querySelector("#uploadTab") as HTMLElement;
            const embedTab = this.htmlElement.querySelector("#embedTab") as HTMLElement;

            const uploadContent = this.htmlElement.querySelector("#uploadContent") as HTMLElement;
            const embedContent = this.htmlElement.querySelector("#embedContent") as HTMLElement;

            // If media upload is active, the mediaInputter uses media upload as the default.
            if (activateMediaUpload && uploadTab && uploadContent) {
                uploadTab.style.display = "inline";

                uploadTab.classList.add("active");
                uploadContent.classList.add("active");

                embedContent.classList.remove("active");
                embedTab.classList.remove("active");

            } else {
                uploadTab.style.display = "none";

                uploadTab.classList.remove("active");
                uploadContent.classList.remove("active");

                embedContent.classList.add("active");
                embedTab.classList.add("active");
            }
        }

        this.htmlElement.style.visibility = "visible";

        if (lastFocused) {
            this.changeToolbarPositionToBeClosedTo(lastFocused);
        }

        super.show();

        const input = document.querySelector("#embedContent input") as HTMLInputElement | null;
        if (input && this.isElementVisible(input)) {

            input.style.backgroundColor = "white";
            setTimeout(() => {
                input.focus();
            }, 100);
        }
    }

    setInputPlaceholder(embed: string): void {

        const input = document.querySelector("#embedContent input") as HTMLInputElement;

        if (embed == "image-embed-placeholder-text") {
            input.setAttribute("placeholder", "https://example.com/image.jpg");
            return;
        }

        if (embed == "youtube-embed-placeholder-text") {
            input.setAttribute("placeholder", "https://www.youtube.com/...");
            return;
        }

        if (embed == "spotify-embed-placeholder-text") {
            input.setAttribute("placeholder", "https://open.spotify.com/...");
            return;
        }

        if (embed == "github-gist-embed-placeholder-text") {
            input.setAttribute("placeholder", "https://gist.github.com/...");
            return;
        }

        if (embed == "codepen-embed-placeholder-text") {
            input.setAttribute("placeholder", "https://codepen.io/...");
            return;
        }

        input.setAttribute("placeholder", "Paste URL here...");
    }

    isElementVisible(element: HTMLElement): boolean {
        if (element.offsetParent === null) return false;

        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    hide() {
        this.inputValue = "";
        super.hide();
    }

    changeToolbarPositionToBeClosedTo(element: HTMLElement): void {
        const rect = element.getBoundingClientRect();

        this.htmlElement.style.display = "flex";

        const targetMidpoint = rect.left + window.scrollX + (rect.width / 2);
        let leftPosition = targetMidpoint - (this.htmlElement.offsetWidth / 2);
        let topPosition = rect.bottom + window.scrollY + 10;

        this.htmlElement.style.left = `${leftPosition}px`;
        this.htmlElement.style.top = `${topPosition}px`;
    }
}