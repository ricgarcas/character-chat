<?php

test('the chat is behind the auth gate for guests', function () {
    $this->get('/chat')->assertRedirect('/login');
});
