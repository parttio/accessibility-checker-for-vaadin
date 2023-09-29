package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.Unit;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.IFrame;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

/**
 * @author jcgueriaud
 */
@PageTitle("frame_title_exists")
@Route(value = "frame_title_exists", layout = MainLayout.class)
public class FrameTitleExistsView extends Div {

    public FrameTitleExistsView() {
        IFrame iframe = new IFrame("/");
        iframe.setHeight(400, Unit.PIXELS);
        iframe.setWidthFull();
        add(iframe);
    }
}