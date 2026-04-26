<?php

test('home redirects guests to login via /chat auth gate', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect('/chat');

    $this->get('/chat')->assertRedirect('/login');
});
