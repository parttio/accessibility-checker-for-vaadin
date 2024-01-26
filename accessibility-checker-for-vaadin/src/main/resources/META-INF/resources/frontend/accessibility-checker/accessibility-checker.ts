import {html, css, LitElement, nothing, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {IEngineResult} from "accessibility-checker/lib/common/engine/IReport";
// @ts-ignore
import {runAccessibilityCheck} from "./accessibility-checker-lib.js";
import {ComponentReference} from "./copy-component-util";

import type {
    DevToolsInterface,
    DevToolsPlugin,
    MessageHandler,
    ServerMessage,
    VaadinDevTools
} from 'Frontend/generated/jar-resources/vaadin-dev-tools/vaadin-dev-tools';
import {injectGlobalCss} from "./copy-styles";
import {ThemeEditor} from "Frontend/generated/jar-resources/vaadin-dev-tools/theme-editor/editor";
import {SelectChangeEvent} from "@vaadin/select";
import {getStyles} from "./accessibility-checker-styles";
import {ACIgnoredRule, ACRuleCategory, ACRuleDetails} from "./accessibility-checker-types";
import {getIconByRuleCategory, getBackIcon, getBackToListIcon, getNextIcon, getDetailsIcon} from "./accessibility-checker-icons";
import {getComponentForNode, getElementForNode, getUiId, getRuleCategory, getTagName, highlight, resetHighlight} from "./accessibility-checker-utils";


injectGlobalCss(css`
  .vaadin-accessibility-checker-highlight {
    outline: solid 2px #9e2cc6;
    outline-offset: 3px;
  }
`);

let devTools: DevToolsInterface;

@customElement('accessibility-checker')
export class AccessibilityChecker extends LitElement implements MessageHandler {

    static styles = getStyles;

    @property()
    filterTagName: string = "";
    @property()
    filterRuleCategory?: ACRuleCategory;

    @property()
    report?: ACRuleDetails[];

    filteredReport?: ACRuleDetails[];

    @property()
    detail?: ACRuleDetails;

    @property()
    indexDetail?: number;

    @property()
    errorMessage?: string;

    private node: Node | null = null;

    private scrollPosition = 0;
    private debugMode = false;

    @state()
    private checkRunning = false;

    /** Ignored rule id, preferably to be configured and loaded in the init method **/
    ignoredRules: ACIgnoredRule[] = [
        {htmlTag: "vaadin-dev-tools"},
        {htmlTag: "vite-plugin-checker-error-overlay"},
        {htmlTag: "vaadin-connection-indicator"},
        {htmlTag: "iframe", lastTag: false},
        {ruleId: "style_before_after_review"},
        {ruleId: "style_highcontrast_visible"},
        {ruleId: "input_fields_grouped"}, // is it really needed to group them with a fieldset
        {ruleId: "style_color_misuse", htmlTag: "style"},
        {ruleId: "table_aria_descendants", htmlTag: "vaadin-grid"}, // maybe the filter could be different
        //  {ruleId: "input_label_before", htmlTag: "vaadin-text-field"}, that's a false positive, the label is before the input
        {ruleId: "input_label_before"}, // that's a false positive, the label is before the input. Maybe we can filter only for vaadin components
        {ruleId: "input_label_after", htmlTag: "vaadin-checkbox"}, // that's a false positive only for the vaadin-checkbox
        {ruleId: "list_structure_proper", htmlTag: "vaadin-side-nav"},
        {ruleId: "aria_child_valid", htmlTag: "vaadin-side-nav"}, // the children "li" are not detected for the ul inside the shadow root of the vaadin-side-nav
        {ruleId: "label_content_exists", htmlTag: "vaadin-select"}, // https://github.com/vaadin/web-components/issues/6912
        {ruleId: "aria_keyboard_handler_exists", htmlTag: "vaadin-combo-box"},
        {ruleId: "aria_keyboard_handler_exists", htmlTag: "vaadin-date-picker"},
        {ruleId: "aria_keyboard_handler_exists", htmlTag: "vaadin-tabs"},
        {ruleId: "aria_keyboard_handler_exists", htmlTag: "vaadin-grid"},
        {ruleId: "element_tabbable_role_valid", htmlTag: "vaadin-grid"},
        {ruleId: "aria_keyboard_handler_exists", htmlTag: "vaadin-grid"},
        {ruleId: "aria_child_valid", htmlTag: "vaadin-grid"},
        {ruleId: "img_alt_background", htmlTag: "vaadin-grid"}, // disable the error when vaadin-grid is row-stripe
        {ruleId: "aria_attribute_redundant", htmlTag: "vaadin-text-field"}, // disable the error with aria-disabled + disabled
        {ruleId: "aria_attribute_redundant", htmlTag: "vaadin-combo-box"}, // disable the error with aria-disabled + disabled
    ];

    startTests() {
        this.checkRunning = true;
        // reset the scroll position
        this.scrollPosition = 0;
        runAccessibilityCheck(document).then(
            (accessibilityCheckResult: any) => {
                const start = new Date().getTime()
                // Remove passing issues
                this.report = accessibilityCheckResult.results.filter(
                    (issue: IEngineResult) => {
                        return this.validateRuleDetails(issue);
                    }
                ).map((ruleDetail: IEngineResult) => ({
                    ...ruleDetail,
                    tagName: getTagName(ruleDetail),
                    ruleCategory: getRuleCategory(ruleDetail.value[0], ruleDetail.value[1]),
                    solved: false
                }));

                const duration = new Date().getTime() - start;
                if (duration > 500) {
                    console.error(`Time elapsed ${duration / 1000}s`);
                } else {
                    console.debug(`Time elapsed ${duration / 1000}s`);
                }
                this.filterTagName = "";
                this.filterRuleCategory = undefined;
                this.checkRunning = false;
            }
        );
    }

    openIde(node:Node) {
        const component = getComponentForNode(node);
        if (component !== undefined) {
            const serializableComponentRef: ComponentReference = {nodeId: component.nodeId, uiId: component.uiId};
            devTools.send(`${AccessibilityChecker.NAME}-show-component-creation-location`, serializableComponentRef);
        } else {
            // Open the Route class
            const uiId = getUiId();
            devTools.send(`${AccessibilityChecker.NAME}-show-route`, {
                uiId: uiId
            });
        }
    }

    async backToList() {
        if (this.detail  !== undefined) {
            resetHighlight(this.detail.node);
        }
        this.detail = undefined;
        this.indexDetail = undefined;
        // wait for the update and set the scroll position
        await this.updateComplete;
        (this.renderRoot.querySelector("#result-list") as HTMLElement).scrollTop = this.scrollPosition;
    }

    back() {
        if (this.detail) {
            resetHighlight(this.detail.node);
        }
        if (this.indexDetail) {
            this.indexDetail--;
        } else {
            if (this.report) {
                this.indexDetail = this.report.length - 1;
            }
        }
        if (this.indexDetail !== undefined && this.filteredReport) {
            this.detail = this.filteredReport[this.indexDetail];
            highlight(this.detail.node);
        }
    }
    next() {
        if (this.detail !== undefined && this.filteredReport) {
            resetHighlight(this.detail.node);
        }
        if (this.indexDetail !== undefined && this.filteredReport && this.indexDetail < this.filteredReport.length - 1) {
            this.indexDetail++;
        } else {
            this.indexDetail = 0;
        }

        if (this.filteredReport) {
            this.detail = this.filteredReport[this.indexDetail];
            highlight(this.detail.node);
        }
    }

    activate() {
        this.checkRunning = false;
        if (this.detail) {
            highlight(this.detail.node);
        }
        const vaadinDevTool = (document.getElementsByTagName('vaadin-dev-tools')[0] as VaadinDevTools);
        vaadinDevTool.setJavaLiveReloadActive(false);
    }

    deactivate() {
        if (this.detail) {
            resetHighlight(this.detail.node);
        }
        const vaadinDevTool = (document.getElementsByTagName('vaadin-dev-tools')[0] as VaadinDevTools);
        vaadinDevTool.setJavaLiveReloadActive(true);
    }
    willUpdate(changedProperties: PropertyValues<this>) {
        if (changedProperties.has('filterTagName') ||changedProperties.has('filterRuleCategory') || changedProperties.has('report')) {
            if (this.report) {
                this.filteredReport = this.report.filter(rule =>
                    (this.filterRuleCategory == null || rule.ruleCategory == this.filterRuleCategory)
                    && (this.filterTagName == "" || rule.tagName.toLowerCase() == this.filterTagName)
                );
            }
        }
    }

    render() {
        if (this.detail !== undefined) {
            return this.renderDetail(this.detail);
        } else {
            return html`
                ${(this.report && this.filteredReport)
                        ? html`<div class="container">
                            <div class="issue-summary">
                              <span>
                                ${this.report.length} issues
                              </span>

                                <button class=${this.filterRuleCategoryClassName(ACRuleCategory.VIOLATION)} @click=${() => this.toggleFilterRuleCategory(ACRuleCategory.VIOLATION)}
                                        ?aria-pressed=${this.isRuleCategoryPressed(ACRuleCategory.VIOLATION)}>
                                    ${getIconByRuleCategory(ACRuleCategory.VIOLATION)}
                                    ${this.report.filter((issue: ACRuleDetails) => issue.ruleCategory == ACRuleCategory.VIOLATION).length}
                                    violations
                                </button>
                                <button class=${this.filterRuleCategoryClassName(ACRuleCategory.NEED_REVIEW)} @click=${() => this.toggleFilterRuleCategory(ACRuleCategory.NEED_REVIEW)}
                                        ?aria-pressed=${this.isRuleCategoryPressed(ACRuleCategory.NEED_REVIEW)}>
                                    ${getIconByRuleCategory(ACRuleCategory.NEED_REVIEW)}
                                    ${this.report.filter((issue: ACRuleDetails) => issue.ruleCategory == ACRuleCategory.NEED_REVIEW).length}
                                    need review
                                </button>
                                <button class=${this.filterRuleCategoryClassName(ACRuleCategory.RECOMMENDATION)} @click=${() => this.toggleFilterRuleCategory(ACRuleCategory.RECOMMENDATION)}
                                        ?aria-pressed=${this.isRuleCategoryPressed(ACRuleCategory.RECOMMENDATION)}>
                                    ${getIconByRuleCategory(ACRuleCategory.RECOMMENDATION)}
                                    ${this.report.filter((issue: ACRuleDetails) => issue.ruleCategory == ACRuleCategory.RECOMMENDATION).length}
                                    recommendations
                                </button>
                                <select .value=${this.filterTagName} @change=${this.clickHandler} class="select-filter-tagname" aria-label="Filter by tag name">
                                    <option value="">All</option>
                                    ${this.getReportTagNames().map((item, index) => html`<option value="${item}">${item}</option>`)}
                                </select>
                                <button class="button button-run" ?disabled=${this.checkRunning} @click=${this.startTests}>
                                    ${(this.checkRunning)? html`<span class="loading-icon"></span>`: nothing}
                                    Re-run Check</button>
                            </div>
                            <ul class="result-list" id="result-list">
                                ${this.filteredReport.map((item, index) => this.renderItemInList(item, index))}
                            </ul>
                        </div>
                        `
                        : html`<div class="issue-summary">
                            <div class="margin-right">Click "Run check" to start the accessibility assessment.</div>
                            <button class="button button-run" ?disabled=${this.checkRunning} @click=${this.startTests}>
                                ${(this.checkRunning)? html`<span class="loading-icon"></span>`: nothing}Run Check</button>
                        </div>
                        `}
            `;

        }
    }
    clickHandler(e: SelectChangeEvent) {
        this.filterTagName = e.target!.value;
    }

    getReportTagNames() {
        if (this.report) {
            return Array.from(new Set(this.report.map((item) => item.tagName.toLowerCase())))
        }
        return [];
    }


    renderItemInList(issue:ACRuleDetails, index:number) {

        const component = getComponentForNode(issue.node);
        return html`<li class="result" @click="${() => {
            // save the scroll position
            this.scrollPosition = (this.renderRoot.querySelector("#result-list") as HTMLElement).scrollTop;
            this.indexDetail = index;
            if (this.filteredReport) {
                this.detail = this.filteredReport[this.indexDetail];
                highlight(this.detail.node);
            }
        }
        }">
            <p class="text">
                <span class="component">
                    <span class="component-tagname">${issue.tagName} </span>
                    ${issue.solved?  html`<span class="component-solved">Solved</span>`: nothing}
                </span>
                <span class="warning-message">
                    ${getIconByRuleCategory(issue.ruleCategory)}  ${issue.message}
                </span>
            </p>
            ${getDetailsIcon()}
        </li>
        `;
    }

    renderDetail(issue:ACRuleDetails) {
        if (this.debugMode) {
            console.debug("Full Issue ", issue);
        }
        const component = getComponentForNode(issue.node);
        return html`
            <div class="detail">
                ${(this.errorMessage) ? html`<div class="result error-message">
                    <span>${this.errorMessage}</span>
                    <button class="button" @click="${() => this.clearErrorMessage()}">Clear</button>
                </div>` : html``}
                <div class="result detail-header">
                    <h2 class="component">${issue.tagName}</h2>

                    <button class="button" @click="${() => this.openIde(issue.node)}">
                        ${(component?.element) ? html`Open the component in IDE` : html`Open the route in IDE`}
                    </button>
                </div>

                <div class="detail-actionbar">
                    <button class="nav-button" @click="${() => this.backToList()}">
                        ${getBackToListIcon()}
                        Back to list
                    </button>
                    <span class="expand"></span>
                    <button class="nav-button" @click="${() => this.back()}">
                        ${getBackIcon()}
                        Previous
                    </button>
                    <button class="nav-button" @click="${() => this.next()}">Next
                        ${getNextIcon()}
                    </button>
                </div>

                <div class="section">
                    <h3 class="component small-heading lower-case">
                        <span class="component-tagname">${issue.tagName} </span>
                        ${issue.solved?  html`<span class="component-solved">Solved</span>`: nothing}
                    </h3>
                    <span class="warning-message">
                        ${getIconByRuleCategory(issue.ruleCategory)}
                        <span>
                            ${issue.message}
                        </span>
                    </span>
                </div>

                ${(this.generateVaadinDetails(issue))
                }

                <div class="section">
                    <h3 class="small-heading">Help <a
                            href="frontend/accessibility-checker/help/en-US/${issue.ruleId}.html"
                            target="_blank">More details</a></h3>

                    <iframe src="frontend/accessibility-checker/help/en-US/${issue.ruleId}.html" title="Help"></iframe>
                </div>

                <div class="section">
                    <h3 class="small-heading">HTML Snippet</h3>
                    <p>${issue.snippet}</p>
                </div>
            </div>
        `;
    }

    private generateVaadinDetails(issue: ACRuleDetails) {
        switch (issue.ruleId) {
            case "input_label_visible":
            case "input_label_exists":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>

                        <div>
                            <label for="input-label">Enter a label and set either a label or an invisible (Aria)
                                label</label>
                            <input class="text-field" id="input-label"
                                   placeholder="Type label here">
                            <button class="button" @click="${() => this.setLabel(issue.node, '#input-label')}">Set
                                label
                            </button>
                            <button class="button" @click="${() => this.setAriaLabel(issue.node, '#input-label')}">Set
                                aria label
                            </button>
                        </div>
                    </div>`;
            case 'a_text_purpose':
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>

                        <div>
                            <label for="input-label">Enter an invisible (Aria) label</label>
                            <input class="text-field" id="input-label"
                                   placeholder="Type label here">
                            <button class="button" @click="${() => this.setAriaLabel(issue.node, '#input-label')}">Set
                                aria label
                            </button>
                        </div>
                    </div>`;
            case "page_title_exists":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue (<a
                                href="https://vaadin.com/docs/latest/routing/page-titles" target="_blank">docs</a>)</h3>

                        <div>
                            <label for="input-page-title">Enter a page title</label>
                            <input class="text-field" id="input-page-title"
                                   placeholder="Type Page Title here">
                            <button class="button" @click="${() => this.setPageTitle('#input-page-title')}">Set page
                                title
                            </button>
                        </div>
                    </div>`;
            case "frame_title_exists":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>
                        <div>
                            <label for="input-label">Enter a title for the html component</label>
                            <input class="text-field" id="input-title" placeholder="Type alternative text here">
                            <button class="button" @click="${() => this.setTitle(issue.node, '#input-title')}">Set
                                title
                            </button>
                        </div>
                    </div>`
            case "img_alt_valid":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>
                        <div>
                            <label for="input-label">Enter an alternative text for the image or an empty text if it's
                                decorative</label>
                            <input class="text-field" id="input-alt" placeholder="Type alternative text here">
                            <button class="button" @click="${() => this.setAltText(issue.node, '#input-alt')}">Set
                                alternative text
                            </button>
                        </div>
                    </div>`
            case "skip_main_exists":
                // todo detect and display the superclass
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>

                        <div>
                            This will replace your superclass for the Route to a Main object if the superclass is a Div.
                            <button class="button" @click="${() => this.updateRouteExtends()}">Update the superclass
                            </button>
                        </div>
                    </div>`;
            case "text_contrast_sufficient":

                return html`
                    <div class="section">
                        <h3 class="small-heading">Hint</h3>

                        <div>
                            You can open the component in the theme editor and update the background or foreground color.
                            <button class="button" @click="${() => this.openComponentInThemeEditor(issue.node)}">Open in the theme editor
                            </button>

                        </div>
                    </div>`;
            case "aria_widget_labelled":
                if (issue.tagName == 'VAADIN-GRID') {
                    return html`
                        <div class="section">
                            <h3 class="small-heading">Linked issue</h3>
                            <div>
                                See this <a href="https://github.com/vaadin/web-components/issues/6749" target="_blank">ticket</a> As a workaround you can do: <br/>
                                <code>grid.getElement().executeJs("this.shadowRoot.querySelector('table').ariaLabel = $0", "My grid name");</code>
                            </div>
                        </div>`;
                }
                return nothing;
            case "element_tabbable_visible":
            case "aria_hidden_nontabbable":
                if (issue.tagName == 'VAADIN-SIDE-NAV') {
                    return html`
                        <div class="section">
                            <h3 class="small-heading">Linked issue</h3>
                            <div>
                                See this <a href="https://github.com/vaadin/web-components/issues/6708" target="_blank">ticket</a>. You can update your Vaadin version to 24.2.5+ to fix the issue.
                            </div>
                        </div>`;
                }
        }
        return nothing;
    }


    setLabel(node:Node, id: string) {
        const labelText = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = getElementForNode(node);
        if (element) {
            // set the label on the client side
            (element as any).label = labelText;
            // set the label on the server side
            const component = getComponentForNode(node);
            
            if (component !== undefined) {
                const serializableComponentRef: ComponentReference = {nodeId: component.nodeId, uiId: component.uiId};
                devTools.send(`${AccessibilityChecker.NAME}-set-label`, {
                    nodeId: component.nodeId,
                    uiId: component.uiId,
                    label: labelText
                });
            }
        }
    }

    setAriaLabel(node:Node, id: string) {
        const labelText = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = getElementForNode(node);
        if (element) {
            // for Vaadin element
            (element as any).accessibleName = labelText;
            // for html element
            element!.ariaLabel = labelText;

            const component = getComponentForNode(node);
            if (component !== undefined) {
                devTools.send(`${AccessibilityChecker.NAME}-set-aria-label`, {
                    nodeId: component.nodeId,
                    uiId: component.uiId,
                    label: labelText
                });
            }
        }
    }

    setPageTitle(id:string) {
        const title = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        document.title = title;
        const uiId = getUiId();
        devTools.send(`${AccessibilityChecker.NAME}-update-page-title`, {
            label: title,
            uiId: uiId
        });
    }

    updateRouteExtends() {
        const uiId = getUiId();
        devTools.send(`${AccessibilityChecker.NAME}-update-route-extends`, {
            uiId: uiId
        });
    }

    // Really hack way of opening the theme editor in the right component
    openComponentInThemeEditor(node:Node) {

        (window as any).Vaadin.devTools.shadowRoot.getElementById('theme-editor').click(); // open the theme editor

        const component = getComponentForNode(node);
        if (component !== undefined) {
            const querySelector = (window as any).Vaadin.devTools.shadowRoot.querySelector('vaadin-dev-tools-theme-editor');
            // Open and configure the pickerComponent (set the pickCallback)
            (querySelector as any).pickComponent();
            // close the picker
            (querySelector as ThemeEditor).pickerProvider().close();
            // Select the component
            (querySelector as ThemeEditor).pickerProvider().options!.pickCallback(component);
        }
    }


    setTitle(node:Node, id: string) {
        const text = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = node as HTMLElement;
        // set the label on the client side
        element.title = text;
        // set the label on the server side
        const component = getComponentForNode(node);
        if (component !== undefined) {
            devTools.send(`${AccessibilityChecker.NAME}-set-title`, {
                nodeId: component.nodeId,
                uiId: component.uiId,
                title: text
            });
        }
    }

    setAltText(node:Node, id: string) {
        const text = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = node as HTMLImageElement;
        // set the label on the client side
        element.alt = text;
        // set the label on the server side
        const component = getComponentForNode(node);
        if (component !== undefined) {
            devTools.send(`${AccessibilityChecker.NAME}-set-alt-text`, {
                nodeId: component.nodeId,
                uiId: component.uiId,
                text: text
            });
        }
    }
    public static NAME = 'accessibility-checker';

    /**
     * Handle the messages from the server
     *
     * @param message
     */
    handleMessage(message: ServerMessage): boolean {

        if (message.command === `${AccessibilityChecker.NAME}-init`) {
            // add the Javascript only when the plugin is initialized
            const scriptElement = document.createElement("script");
            scriptElement.setAttribute("src", "https://unpkg.com/accessibility-checker-engine@latest/ace.js");
            scriptElement.setAttribute("async", "true");
            document.body.appendChild(scriptElement);
            // Do something
            return true; // Mark the message as handled
        }
        if (message.command === `${AccessibilityChecker.NAME}-error`) {
            console.error(message.data.message);
            this.errorMessage = message.data.message;
            return true; // Mark the message as handled
        }

        if (message.command === `${AccessibilityChecker.NAME}-success`) {
            if (this.detail  !== undefined) {
                this.detail.solved = true; // update the object for the list
                this.detail = {...this.detail, solved: true}; // update the instance to refresh the detail view
            }
            return true; // Mark the message as handled
        }
        return false; // The message was not handled
    }

    clearErrorMessage() {
        this.errorMessage = undefined;
    }

    /**
     * Apply all the ignoring rules to the issue, if one is matching then return false
     * @param issue
     * @private
     */
    private validateRuleDetails(issue: IEngineResult) {
        if (issue.value[1] == "PASS") {
            return false;
        }

        for (let ignoredRule of this.ignoredRules) {
            const ignoredRuleId = (ignoredRule.ruleId == undefined) || (ignoredRule.ruleId == issue.ruleId);
            if (ignoredRuleId) {
                if (ignoredRule.htmlTag == undefined) {
                    // rule ignored and no more rule is applying
                    return false;
                }
                // it fits, check next
                if (ignoredRule.lastTag == undefined) {
                    const ignoredRuleHtmlTag = (issue.path.dom.includes(ignoredRule.htmlTag));
                    if (ignoredRuleHtmlTag) {
                        // console.debug("1 ignoredRuleHtmlTag for {} RULE: {}", issue, ignoredRule);
                        return false; //
                    } // else check the next rule
                } else if (ignoredRule.lastTag) {
                    const ignoredRuleHtmlTag = ((issue.path.dom.includes(ignoredRule.htmlTag)) && (((issue.node  as HTMLElement).tagName === ignoredRule.htmlTag.toUpperCase())));
                    if (ignoredRuleHtmlTag) {
                        // console.debug("2 ignoredRuleHtmlTag for {} RULE: {}", issue, ignoredRule);
                        return false; //
                    } // else check the next rule
                } else {
                    const ignoredRuleHtmlTag = ((issue.path.dom.includes(ignoredRule.htmlTag)) && ((issue.node  as HTMLElement).tagName !== ignoredRule.htmlTag.toUpperCase()));
                    if (ignoredRuleHtmlTag) {
                        // console.debug("3 ignoredRuleHtmlTag for {} RULE: {}", issue, ignoredRule);
                        return false; //
                    } // else check the next rule
                }
            }
        }
        return true;
    }

    private isRuleCategoryPressed(category: ACRuleCategory) {
        return ((this.filterRuleCategory != undefined) && (category == this.filterRuleCategory));
    }
    private filterRuleCategoryClassName(category: ACRuleCategory) {
        return ((this.filterRuleCategory == undefined) || (category == this.filterRuleCategory))? "button activated-category" : "button deactivated-category";
    }

    private toggleFilterRuleCategory(category: ACRuleCategory) {
        if (category == this.filterRuleCategory) {
            this.filterRuleCategory = undefined;
        } else {
            this.filterRuleCategory = category;
        }
    }
}


const plugin: DevToolsPlugin = {
    init: function (devToolsInterface: DevToolsInterface): void {
        devTools = devToolsInterface;
        devTools.addTab('Accessibility Checker', AccessibilityChecker.NAME);
    }
};


(window as any).Vaadin.devToolsPlugins.push(plugin);