import { ViewBox } from "./interfaces";

export function convertToTitleCase(input: string): string {
  // Replace underscores with spaces
  const stringWithSpaces = input.replace(/_/g, ' ');

  // Convert to title case
  const words = stringWithSpaces.toLowerCase().split(' ');
  const titleCaseWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  const titleCaseString = titleCaseWords.join(' ');

  return titleCaseString;
}


export function convertToLowerCaseSeparatedWords(str: string) {
  // Replace underscores with spaces
  const stringWithSpaces = str.replace(/_/g, " ");

  const words = stringWithSpaces.toLowerCase().split(" ");
  const convertedString = words.join("-");

  return convertedString;
}

export function extractSecondPart(str: string) {
  const regex = /\[([^.\]]+)\](?:\.(\[[^.\]]+\]|[^.\[\]]+))?/;
  const match = str.match(regex);

  if (match) {
    const secondPart = match[2] || match[1];
    const parts = secondPart.split(".");
    return parts[parts.length - 1].replace(/\[|\]/g, "");
  }

  const lastDotIndex = str.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return str.substring(lastDotIndex + 1);
  }

  return str;
}

export function makeSvgScrollable(svgPointer: SVGSVGElement, viewBox: ViewBox) {
  let isDragging = false;
  let startCoords = { x: 0, y: 0 };

  svgPointer.addEventListener("mousedown", startDrag);
  svgPointer.addEventListener("mousemove", handleDrag);
  svgPointer.addEventListener("mouseup", endDrag);
  svgPointer.addEventListener("mouseleave", endDrag);

  function startDrag(event: any) {
    isDragging = true;
    startCoords = { x: event.clientX, y: event.clientY };
  }

  function handleDrag(event: any) {
    if (isDragging) {
      const { clientX, clientY } = event;
      const dx = clientX - startCoords.x;
      const dy = clientY - startCoords.y;

      viewBox.x -= dx * 1.2;
      viewBox.y -= dy * 1.2;

      svgPointer.setAttribute(
        "viewBox",
        `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
      );

      startCoords = { x: clientX, y: clientY };
    }
  }

  function endDrag() {
    isDragging = false;
  }
}

export function makeSvgZoomable(svgPointer: SVGSVGElement, viewBox: ViewBox) {
  let scaleFactor = 1;

  svgPointer.addEventListener("wheel", handleZoom);

  function handleZoom(event: WheelEvent) {
    event.preventDefault();

    const delta = Math.sign(-event.deltaY); // Reverse the sign of deltaY
    const isZoomingIn = delta > 0;
    const isZoomingOut = delta < 0;
    const zoomAmount = 0.05 * delta; // Adjust the zoom speed as desired

    const targetScaleFactor = scaleFactor + zoomAmount;
    const newWidth = viewBox.width / targetScaleFactor;
    const newHeight = viewBox.height / targetScaleFactor;

    // Apply zoom only if within the allowed limits
    const mouseX = event.clientX - svgPointer.getBoundingClientRect().left;
    const mouseY = event.clientY - svgPointer.getBoundingClientRect().top;

    const dx = (mouseX - viewBox.x) * (zoomAmount / targetScaleFactor);
    const dy = (mouseY - viewBox.y) * (zoomAmount / targetScaleFactor);

    viewBox.x -= dx;
    viewBox.y -= dy;

    if(isZoomingIn) {
      if(newWidth > viewBox.width) {
        return;
      }
    }

    if(isZoomingOut) {
      if(newWidth < viewBox.width) {
        return;
      }
    }

    viewBox.width = newWidth;
    viewBox.height = newHeight;


    if ((viewBox.width < 450 || viewBox.height < 250) && isZoomingIn) {
      
      // zoom in limit reached
      viewBox.width = 450;
      viewBox.height = 250;
      return;
    }

    if ((viewBox.width > 9000) && isZoomingOut) {
      // zoom  limit reached
      viewBox.width = 9000;
      viewBox.height = 4500;
      return;
    }

    svgPointer.setAttribute(
      "viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    );
  }
}
