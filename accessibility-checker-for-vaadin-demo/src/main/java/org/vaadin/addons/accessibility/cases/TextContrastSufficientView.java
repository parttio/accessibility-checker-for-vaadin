package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.icon.Icon;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

@PageTitle("text_contrast_sufficient")
@Route(value = "text_contrast_sufficient", layout = MainLayout.class)
public class TextContrastSufficientView extends Div {

    public TextContrastSufficientView() {
        TextField textField = new TextField();
        Icon searchIcon = VaadinIcon.SEARCH.create();
        textField.setPrefixComponent(searchIcon);
        textField.setLabel("Search");
        add(textField);
    }
}