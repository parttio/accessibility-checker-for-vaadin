package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Main;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.component.html.Main;

@Route("test")
@PageTitle("My Test page")
public class TestView extends Main {

    public TestView() {
        TextField textField = new TextField();
        //<accessibility-plugin-label>
        textField.setLabel("My input");
        add(textField);
    }
}