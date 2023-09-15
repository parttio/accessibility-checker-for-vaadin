package org.vaadin.addons.accessibility.visitors;

import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.expr.AnnotationExpr;
import com.github.javaparser.ast.expr.NormalAnnotationExpr;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import com.vaadin.flow.router.PageTitle;

class ClassVisitor extends VoidVisitorAdapter<Void> {

    private final String PAGE_TITLE_ANNOTATION = PageTitle.class.getSimpleName();
    
    @Override
    public void visit(ClassOrInterfaceDeclaration cid, Void arg) {
        super.visit(cid, arg);
        boolean isAnnotated = false;
        for (AnnotationExpr node : cid.getAnnotations()){
            if (PAGE_TITLE_ANNOTATION.equals(node.toString())) {
                isAnnotated = true;
                break;
            }
            // todo
        }
        if (!isAnnotated) {
            cid.addSingleMemberAnnotation(PageTitle.class, "\"value\"");
        }
    }
}