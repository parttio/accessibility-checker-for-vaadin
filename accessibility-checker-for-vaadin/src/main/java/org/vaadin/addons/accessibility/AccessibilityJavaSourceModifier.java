package org.vaadin.addons.accessibility;

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

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.ImportDeclaration;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.expr.*;
import com.github.javaparser.ast.nodeTypes.NodeWithBlockStmt;
import com.github.javaparser.ast.nodeTypes.NodeWithExpression;
import com.github.javaparser.ast.stmt.ExpressionStmt;
import com.github.javaparser.ast.stmt.Statement;
import com.github.javaparser.printer.lexicalpreservation.LexicalPreservingPrinter;
import com.github.javaparser.utils.SourceRoot;
import com.vaadin.base.devserver.editor.Editor;
import com.vaadin.base.devserver.editor.Where;
import com.vaadin.base.devserver.themeeditor.utils.LineNumberVisitor;
import com.vaadin.base.devserver.themeeditor.utils.ThemeEditorException;
import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.internal.ComponentTracker;
import com.vaadin.flow.dom.Element;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.server.VaadinContext;
import com.vaadin.flow.server.VaadinSession;
import com.vaadin.flow.server.startup.ApplicationConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.vaadin.addons.accessibility.visitors.AriaLabelVisitor;
import org.vaadin.addons.accessibility.visitors.GenericStringVisitor;
import org.vaadin.addons.accessibility.visitors.LabelVisitor;

import java.io.File;
import java.nio.file.Path;
import java.util.*;

import static com.github.javaparser.StaticJavaParser.parseExpression;
import static com.github.javaparser.StaticJavaParser.parseName;

public class AccessibilityJavaSourceModifier extends Editor {

    private final VaadinContext context;
    public AccessibilityJavaSourceModifier(VaadinContext context) {
        this.context = context;
    }

    /**
     * Adds local component class name if not already present, updates value
     * otherwise.
     *
     * @param uiId
     *            uiId of target component's UI
     * @param nodeId
     *            nodeIf of target component
     * @param label
     *            className to be set
     */
    public void setLabel(Integer uiId, Integer nodeId,
            String label) {
        assert uiId != null && nodeId != null && label != null;
        VaadinSession session = getSession();
        getSession().access(() -> {
            Component component = getComponent(session, uiId, nodeId);
            setLabel(component, label, new LabelVisitor());
        });
    }

    public void setAriaLabel(Integer uiId, Integer nodeId,
            String label) {
        assert uiId != null && nodeId != null && label != null;
        VaadinSession session = getSession();
        session.access(() -> {
            Component component = getComponent(session, uiId, nodeId);
            setLabel(component, label, new AriaLabelVisitor());
        });
    }

    public static String escapeForJava(String value, boolean quote) {
        StringBuilder builder = new StringBuilder();
        if (quote)
            builder.append("\"");
        for (char c : value.toCharArray()) {
            if (c == '\'')
                builder.append("\\'");
            else if (c == '\"')
                builder.append("\\\"");
            else if (c == '\r')
                builder.append("\\r");
            else if (c == '\n')
                builder.append("\\n");
            else if (c == '\t')
                builder.append("\\t");
            else if (c < 32 || c >= 127)
                builder.append(String.format("\\u%04x", (int) c));
            else
                builder.append(c);
        }
        if (quote)
            builder.append("\"");
        return builder.toString();
    }

    public void setPageTitle(Integer uiId, String pageTitle) {
        assert uiId != null && pageTitle != null;
        VaadinSession session = getSession();
        session.access(() -> {
            Component currentView = session.getUIById(uiId).getCurrentView();
            try {
                List<Modification> modifications = new ArrayList<>();
                ComponentTracker.Location createLocation = getCreateLocation(
                        currentView);
                File sourceFile = getSourceFile(createLocation);
                int sourceOffset = modifyClass(sourceFile, cu -> {

                    Optional<ClassOrInterfaceDeclaration> classOrInterfaceDeclaration = cu.getClassByName(currentView.getClass().getSimpleName());
                    classOrInterfaceDeclaration.ifPresent(node -> {
                        SingleMemberAnnotationExpr normalAnnotationExpr = new SingleMemberAnnotationExpr(
                                parseName(PageTitle.class.getSimpleName()),
                                parseExpression(escapeForJava(pageTitle, true))
                        );
                        node.addAnnotation(normalAnnotationExpr);
                        //NormalAnnotationExpr normalAnnotationExpr = node.addAndGetAnnotation(PageTitle.class);
                       // normalAnnotationExpr.addPair("value", escapeForJava(pageTitle, true));
                        modifications.add(Modification.insertLineBefore(node, normalAnnotationExpr));
                    });
                    return modifications;
                });

                if (sourceOffset != 0) {
                    ComponentTracker.refreshLocation(createLocation, sourceOffset);
                }

            } catch (UnsupportedOperationException ex) {
                throw new ThemeEditorException(ex);
            }
        });
    }
    protected void setLabel(Component component, String label, GenericStringVisitor visitor) {
        try {
            ComponentTracker.Location createLocation = getCreateLocation(
                    component);
            File sourceFile = getSourceFile(createLocation);
            int sourceOffset = modifyClass(sourceFile, cu -> {
                SimpleName scope = findLocalVariableOrField(cu,
                        createLocation.lineNumber());
                Node newNode = createAddStatement(scope, label, visitor);
                Modification mod;
                ExpressionStmt stmt = findStmt(cu, component, visitor);
                if (stmt == null) {
                    Node node = findNode(cu, component);
                    Where where = findModificationWhere(cu, component);
                    mod = switch (where) {
                    case AFTER -> Modification.insertLineAfter(node, newNode);
                    case INSIDE ->
                        Modification.insertAtEndOfBlock(node, newNode);
                    case BEFORE -> Modification.insertLineBefore(node, newNode);
                    };
                } else {
                    mod = Modification.replace(stmt, newNode);
                }
                return Collections.singletonList(mod);
            });

            if (sourceOffset != 0) {
                ComponentTracker.refreshLocation(createLocation, sourceOffset);
            }

        } catch (UnsupportedOperationException ex) {
            throw new ThemeEditorException(ex);
        }
    }

    protected ComponentTracker.Location getCreateLocation(Component c) {
        ComponentTracker.Location location = ComponentTracker.findCreate(c);
        if (location == null) {
            throw new ThemeEditorException(
                    "Unable to find the location where the component "
                            + c.getClass().getName() + " was created");
        }
        return location;
    }

    protected VaadinSession getSession() {
        return VaadinSession.getCurrent();
    }

    protected File getSourceFolder(ComponentTracker.Location location) {
        Path javaSourceFolder = ApplicationConfiguration.get(context)
                .getJavaSourceFolder().toPath();
        String[] splitted = location.className().split("\\.");
        return Path.of(javaSourceFolder.toString(),
                Arrays.copyOf(splitted, splitted.length - 1)).toFile();
    }

    protected Statement createAddStatement(SimpleName scope,
                                                String className,
                                                GenericStringVisitor visitor) {
        MethodCallExpr methodCallExpr = new MethodCallExpr(visitor.getMethodName());
        if (scope != null) {
            methodCallExpr.setScope(new NameExpr(scope));
        }
        methodCallExpr.getArguments().add(new StringLiteralExpr(className));
        Statement statement = new ExpressionStmt(methodCallExpr);
        statement.setComment(visitor.getComment());
        return statement;
    }

    protected File getSourceFile(ComponentTracker.Location createLocation) {
        File sourceFolder = getSourceFolder(createLocation);
        return new File(sourceFolder, createLocation.filename());
    }

    protected Component getComponent(VaadinSession session, int uiId,
            int nodeId) {
        Element element = session.findElement(uiId, nodeId);
        Optional<Component> c = element.getComponent();
        if (!c.isPresent()) {
            throw new ThemeEditorException(
                    "Only component locations are tracked. The given node id refers to an element and not a component.");
        }
        return c.get();
    }

    protected ExpressionStmt findStmt(CompilationUnit cu,
                                      Component component, GenericStringVisitor visitor) {
        ComponentTracker.Location createLocation = getCreateLocation(component);
        SimpleName scope = findLocalVariableOrField(cu,
                createLocation.lineNumber());
        return cu.accept(visitor,
                scope != null ? scope.getIdentifier() : null);
    }

    protected Where findModificationWhere(CompilationUnit cu,
            Component component) {
        Node node = findNode(cu, component);
        if (node instanceof NodeWithBlockStmt<?>) {
            return Where.INSIDE;
        }
        if (node instanceof NodeWithExpression<?> expr
                && (expr.getExpression().isAssignExpr()
                        || expr.getExpression().isVariableDeclarationExpr())) {
            return Where.AFTER;
        }
        throw new ThemeEditorException("Cannot apply classname for " + node);
    }

    protected Node findNode(CompilationUnit cu, Component component) {
        ComponentTracker.Location createLocation = getCreateLocation(component);
        Node node = cu.accept(new LineNumberVisitor(),
                createLocation.lineNumber());
        if (node == null) {
            throw new ThemeEditorException("Cannot find component.");
        }
        return node;
    }

    private static Logger getLogger() {
        return LoggerFactory.getLogger(AccessibilityJavaSourceModifier.class);
    }

}
