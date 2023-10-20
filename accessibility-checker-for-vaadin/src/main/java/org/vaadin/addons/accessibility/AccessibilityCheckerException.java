package org.vaadin.addons.accessibility;

public class AccessibilityCheckerException extends RuntimeException {
    public AccessibilityCheckerException() {
    }

    public AccessibilityCheckerException(String message) {
        super(message);
    }

    public AccessibilityCheckerException(String message, Throwable cause) {
        super(message, cause);
    }

    public AccessibilityCheckerException(Throwable cause) {
        super(cause);
    }

    public AccessibilityCheckerException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}