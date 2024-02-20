package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;

@Route("demo")
public class DemoView extends VerticalLayout {

    public DemoView() {
        TextField textField = new TextField();
        add(textField);
        TextField textField1 = new TextField();
        add(textField1);
        add(new TextField());
        add(new TextField());
        add(new TextField());
        add(new TextField());
        add(new TextField());
        add(new TextField());
        add(new TextField());
        add(new TextField());
    }
}