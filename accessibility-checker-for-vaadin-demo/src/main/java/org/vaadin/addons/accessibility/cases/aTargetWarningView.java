package org.vaadin.addons.accessibility.cases;

import org.vaadin.addons.accessibility.MainLayout;

import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.html.AnchorTarget;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("a_target_warning")
@Route(value = "a_target_warning", layout = MainLayout.class)
public class aTargetWarningView extends Div {

    public aTargetWarningView() {
        Anchor anchor = new Anchor("https://vaadin.com", "Vaadin website (opens in new window)");
        anchor.setTarget(AnchorTarget.BLANK);
        Anchor anchor2 = new Anchor("https://vaadin.com", "Vaadin website (test)");
        anchor.setTarget(AnchorTarget.BLANK);
        Anchor anchor3 = new Anchor("https://vaadin.com");
        anchor3.add(VaadinIcon.ANCHOR.create(), new Span( "Vaadin website"));
        anchor3.setTarget(AnchorTarget.BLANK);
        add(new VerticalLayout(new Paragraph("""
                You can add the information in parenthesis
                """
        ),
                anchor, anchor2, anchor3));
    }
}