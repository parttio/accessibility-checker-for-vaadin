

export function runAccessibilityCheck(document) {
    return sleep(1).then(() => {
        const checker = new ace.Checker();
        return checker.check(document, ["WCAG_2_1"]);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}