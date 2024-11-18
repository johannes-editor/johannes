import { CommonClasses } from "@/common/CommonClasses";
import { IImageAlt } from "./IImageAlt";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { Utils } from "@/utilities/Utils";

export class ImageAlt implements IImageAlt {
  private static instance: ImageAlt | null = null;

  currentImage: HTMLImageElement | null = null;
  inputElement: HTMLInputElement | null = null;
  containerDiv: HTMLDivElement | null = null;
  closeButton: HTMLButtonElement | null = null;

  private constructor() {
    this.listen();
  }

  static getInstance(): ImageAlt {
    if (ImageAlt.instance) {
      return ImageAlt.instance;
    }

    return new ImageAlt();
  }

  startListen(): void {
    console.log("listening image clicks");
  }

  cleanup() {
    if (this.currentImage) {
      this.currentImage.style.boxShadow = "";
      this.currentImage = null;
    }
    if (this.containerDiv) {
      this.containerDiv.parentNode?.removeChild(this.containerDiv);
      this.containerDiv = null;
    }
    this.inputElement = null;
    this.closeButton = null;
  }

  listen() {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      if (target && target.tagName === "IMG") {
        const img = target as HTMLImageElement;

        this.cleanup();

        img.style.boxShadow = "0px 0px 0px 2px #007bff";

        this.containerDiv = document.createElement("div");
        this.containerDiv.classList.add("image-alt-container", CommonClasses.EditorOnly, "soft-box-shadow");

        this.containerDiv.style.position = "absolute";
        this.containerDiv.style.padding = "10px 15px";
        this.containerDiv.style.borderRadius = "4px";
        this.containerDiv.style.backgroundColor = "white";
        this.containerDiv.style.color = "#242424";
        this.containerDiv.style.zIndex = "1000";
        this.containerDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
        this.containerDiv.style.display = "flex";
        this.containerDiv.style.alignItems = "center";
        this.containerDiv.style.gap = "5px";

        this.inputElement = document.createElement("input");
        this.inputElement.classList.add(

        );
        this.inputElement.type = "text";
        this.inputElement.placeholder = "Alt text";
        this.inputElement.value = img.alt || "";

        this.inputElement.style.outline = "none";
        this.inputElement.style.borderColor = "transparent";
        this.inputElement.style.width = "100%";
        this.inputElement.style.boxSizing = "border-box";

        this.closeButton = document.createElement("button");
        this.closeButton.innerHTML = "&times;";
        this.closeButton.classList.add("close-button");

        this.closeButton.style.background = "none";
        this.closeButton.style.border = "none";
        this.closeButton.style.fontSize = "1rem";
        this.closeButton.style.cursor = "pointer";
        this.closeButton.style.color = "#242424";
        this.closeButton.style.padding = "0";
        this.closeButton.style.margin = "0";

        this.closeButton.addEventListener("click", () => {
          if (this.currentImage && this.inputElement) {
            this.currentImage.alt = this.inputElement.value;
            this.cleanup();
          }
        });

        this.containerDiv.appendChild(this.inputElement);
        this.containerDiv.appendChild(this.closeButton);

        const rect = img.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        document.body.appendChild(this.containerDiv);

        const containerRect = this.containerDiv.getBoundingClientRect();

        this.containerDiv.style.left = `${rect.left + scrollX - 2}px`;
        this.containerDiv.style.top = `${
          rect.top + scrollY - containerRect.height - 10
        }px`;

        this.inputElement.focus();

        this.currentImage = img;
      } else if (
        this.inputElement &&
        (target === this.inputElement || target === this.closeButton)
      ) {
      } else {
        if (this.currentImage && this.inputElement) {
          this.currentImage.alt = this.inputElement.value;
          this.cleanup();
        }
      }
    });

    document.addEventListener(DefaultJSEvents.Keydown, (event) => {

      if (!Utils.isEventFromContentWrapper(event)) {
        return;
      }

      if (event.key === "Escape") {
        if (this.currentImage && this.inputElement) {
          this.currentImage.alt = this.inputElement.value;
          this.cleanup();
        }
      } else if (event.key === "Enter") {
        if (
          this.inputElement &&
          document.activeElement === this.inputElement
        ) {
          if (this.currentImage && this.inputElement) {
            this.currentImage.alt = this.inputElement.value;
            this.cleanup();
          }
        }
      }
    }, true);
  }
}