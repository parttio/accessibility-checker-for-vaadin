package org.vaadin.addons.accessibility.visitors;

import com.github.javaparser.ast.comments.LineComment;
import com.github.javaparser.ast.stmt.ExpressionStmt;
import com.github.javaparser.ast.visitor.GenericVisitor;

/**
 * @author jcgueriaud
 */
public interface GenericStringVisitor extends GenericVisitor<ExpressionStmt, String> {

    String getMethodName();

    LineComment getComment();
}
