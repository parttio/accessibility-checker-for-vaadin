import {svg, nothing} from 'lit';
import {ACRuleCategory} from "./accessibility-checker-types";

/**
 * Generate an icon based on the type of the issue
 * @param ruleCategory
 * @private
 */
export function getIconByRuleCategory(ruleCategory: ACRuleCategory) {
    switch (ruleCategory) {
        case ACRuleCategory.VIOLATION:
            return svg`
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM15.25 13.5L13.5 15.25L10 11.75L6.5 15.25L4.75 13.5L8.25 10L4.75 6.5L6.5 4.75L10 8.25L13.5 4.75L15.25 6.5L11.75 10L15.25 13.5Z" fill="#FF3A49"/>
                    </svg>`;
        case ACRuleCategory.NEED_REVIEW:
            return svg`
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none">
                        <path d="M10 0.25L0 17.75H20L10 0.25ZM10 15.25C9.25 15.25 8.75 14.75 8.75 14C8.75 13.25 9.25 12.75 10 12.75C10.75 12.75 11.25 13.25 11.25 14C11.25 14.75 10.75 15.25 10 15.25ZM8.75 11.5V6.5H11.25V11.5H8.75Z" fill="#FFDB7D"/>
                    </svg>`;
        case ACRuleCategory.RECOMMENDATION:
            return svg`
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM11.25 16.25H8.75V7.5H11.25V16.25ZM11.25 6.25H8.75V3.75H11.25V6.25Z" fill="#57A1F8"/>
                    </svg>`;
        default:
            return nothing;
    }
}


export function getNextIcon() {
    return svg`
            <svg class="icon" width="12" height="12" viewBox="0 0 12 12" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M9.00483 5.09089L6.31683 2.0909C6.00483 1.7309 6.02883 1.1549 6.41283 0.818902C6.77283 0.506903 7.34883 0.530903 7.66083 0.914902L11.6688 5.40289C11.9808 5.76289 11.9808 6.26689 11.6688 6.60288L7.66083 11.0909C7.34883 11.4749 6.77283 11.4989 6.41283 11.1629C6.02883 10.8509 6.00483 10.2749 6.31683 9.91488L9.00483 6.89088L0.98883 6.89088C0.50883 6.89088 0.10083 6.50689 0.10083 6.00289C0.10083 5.49889 0.50883 5.09089 0.98883 5.09089L9.00483 5.09089Z"
                      fill="white"/>
            </svg>`;
}
export function getBackIcon() {
    return svg`<svg class="icon" width="12" height="12" viewBox="0 0 12 12" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
            <path d="M2.99517 6.90911L5.68317 9.9091C5.99517 10.2691 5.97117 10.8451 5.58717 11.1811C5.22717 11.4931 4.65117 11.4691 4.33917 11.0851L0.33117 6.59711C0.0191693 6.23711 0.0191694 5.73311 0.33117 5.39711L4.33917 0.909127C4.65117 0.525128 5.22717 0.501128 5.58717 0.837127C5.97117 1.14913 5.99517 1.72512 5.68317 2.08512L2.99517 5.10912L11.0112 5.10912C11.4912 5.10912 11.8992 5.49311 11.8992 5.99711C11.8992 6.50111 11.4912 6.90911 11.0112 6.90911L2.99517 6.90911Z"
                  fill="white"/>
        </svg> `;
}

export function getBackToListIcon() {
    return svg`<svg class="icon" width="20" height="15" viewBox="0 0 20 15" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
            <path d="M0 6.875L7.5 0.75V4.5C7.5 4.5 8.875 4.5 10 4.5C20 4.5 20 14.5 20 14.5C20 14.5 18.75 9.5 10.25 9.5C8.875 9.5 8 9.5 7.5 9.5V13.125L0 6.875H0Z"
                  fill="white"/>
        </svg>`;
}

export function getDetailsIcon() {
    return svg`<svg class="arrow" width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.7" d="M0.25 13.25H2.75L9 7L2.75 0.75H0.25L6.5 7L0.25 13.25Z" fill="white"/>
        </svg>`;
}