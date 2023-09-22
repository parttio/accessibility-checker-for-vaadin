package org.vaadin.addons.accessibility.visitors;

import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.visitor.GenericVisitorAdapter;

/**
 * @author jcgueriaud
 */
public class ConstructorVisitor extends GenericVisitorAdapter<ConstructorDeclaration, Void> {
    @Override
    public ConstructorDeclaration visit(ConstructorDeclaration constructorDeclaration, Void arg) {
        return constructorDeclaration;
    }

}
