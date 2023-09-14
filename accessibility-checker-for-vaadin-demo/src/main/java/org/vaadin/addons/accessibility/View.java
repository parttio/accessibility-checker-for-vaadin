package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("test")
@Route("")
public class View extends VerticalLayout {

    public View() {
        TextField axaInputText = new TextField();
        add(axaInputText);
    }
}
