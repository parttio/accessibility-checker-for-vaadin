package com.vaadin.base.devserver.editor.inputs;

import com.example.application.views.MainLayout;
import com.vaadin.flow.component.Key;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;

import jakarta.servlet.ServletContext;

@Route(value = "demo", layout = MainLayout.class)
public class DemoFile extends HorizontalLayout {

    private TextField name;
    private Button sayHello;

    public DemoFile() {
        name = new TextField();

        add(name);
    }

}