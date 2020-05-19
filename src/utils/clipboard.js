export function copyToClipboard(value) {
    function createInput(text) {
        const textArea = document.createElement('textArea');
        textArea.readOnly = true;
        textArea.value = text;
        document.body.appendChild(textArea);
        return textArea;
    }

    const copyInput = createInput(value);

    if (window.navigator.userAgent.match(/ipad|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(copyInput);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        copyInput.setSelectionRange(0, 999999);
    } else {
        copyInput.select();
    }

    document.execCommand('copy');

    document.body.removeChild(copyInput);
}

export default copyToClipboard;
