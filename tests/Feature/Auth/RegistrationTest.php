<?php

// Public self-registration is intentionally disabled.

test('registration screen is not available', function () {
    $this->get('/register')->assertNotFound();
});

test('registration cannot be submitted', function () {
    $this->post('/register', [
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertNotFound();

    $this->assertGuest();
});
