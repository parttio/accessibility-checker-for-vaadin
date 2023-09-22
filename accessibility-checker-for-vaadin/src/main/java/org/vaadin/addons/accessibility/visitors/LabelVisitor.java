package org.vaadin.addons.accessibility.visitors;

/*-
 * #%L
 * Accessibility checker
 * %%
 * Copyright (C) 2023 Team Parttio
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

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
public class LabelVisitor
        extends GenericVisitorAdapter<ExpressionStmt, String>  implements GenericStringVisitor{

    public static final String METHOD_NAME = "setLabel";
    private final SimpleName methodName = new SimpleName(METHOD_NAME);
    public static final LineComment COMMENT = new LineComment("<accessibility-plugin-label>");

    public LabelVisitor() {
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


    @Override
    public boolean isTranslated() {
        return false;
    }
}
