package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

@PageTitle("a_text_purpose")
@Route(value = "a_text_purpose", layout = MainLayout.class)
public class ATextPurposeView extends Div {

    public ATextPurposeView() {
        Anchor anchor = new Anchor("/", VaadinIcon.ANCHOR.create());
        add(new VerticalLayout(anchor));
    }
}