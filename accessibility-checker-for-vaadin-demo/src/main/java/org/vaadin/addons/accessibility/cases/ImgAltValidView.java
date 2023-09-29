package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

@PageTitle("img_alt_valid")
@Route(value = "img_alt_valid", layout = MainLayout.class)
public class ImgAltValidView extends Div {

    public ImgAltValidView() {
        Image image = new Image();
        image.setSrc("icons/icon.png");
        add(image);
    }
}