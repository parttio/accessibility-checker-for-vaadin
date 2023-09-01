package org.vaadin.addons.accessibility.visitors;

import com.github.javaparser.ast.comments.LineComment;
import com.github.javaparser.ast.expr.Expression;
import com.github.javaparser.ast.expr.SimpleName;
import com.github.javaparser.ast.stmt.ExpressionStmt;
import com.github.javaparser.ast.visitor.GenericVisitorAdapter;

/**
 * Implementation of {@link com.github.javaparser.ast.visitor.GenericVisitor}
 * that searches for local classname expression statement by comparing
 * expression type, method call scope and expression comment.
 *
 * Scope may be null in case of own instance method calls.
 */
public class AriaLabelVisitor
        extends GenericVisitorAdapter<ExpressionStmt, String> implements GenericStringVisitor {

    private static final String METHOD_NAME = "setAriaLabel";
    private final SimpleName methodName = new SimpleName(METHOD_NAME);
    private static final LineComment COMMENT = new LineComment("<accessibility-plugin-aria-label>");

    public AriaLabelVisitor() {
    }

    @Override
    public ExpressionStmt visit(ExpressionStmt n, String scope) {
        // filter anything other than method calls
        if (!n.getExpression().isMethodCallExpr()) {
            return super.visit(n, scope);
        }

        // and anything without matching comment
        if (n.getComment()
                .filter(COMMENT::equals)
                .isEmpty()) {
            return super.visit(n, scope);
        }

        // and not required method calls
        if (!n.getExpression().asMethodCallExpr().getName()
                .equals(methodName)) {
            return super.visit(n, scope);
        }

        // and with not matching scope (if defined)
        if (scope != null && n.getExpression().asMethodCallExpr().getScope()
                .map(Expression::toString).filter(scope::equals).isEmpty()) {
            return super.visit(n, scope);
        }

        // voila!
        return n;
    }

    @Override
    public String getMethodName() {
        return METHOD_NAME;
    }

    @Override
    public LineComment getComment() {
        return COMMENT;
    }
}