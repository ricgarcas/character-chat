import { Form, Head, Link } from '@inertiajs/react';
import { store } from '@/routes/register';
import { useT } from '@/lib/i18n';
import { LocaleToggle } from '@/components/locale-toggle';

export default function Register() {
    const t = useT();
    return (
        <>
            <Head title="Sign up" />

            <LocaleToggle fixed />

            <div className="bg-paper relative flex min-h-svh flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <h1
                            className="font-display text-xl uppercase tracking-tight text-[var(--ink)]"
                            style={{ textShadow: '3px 3px 0 var(--pixel-shadow)' }}
                        >
                            {t('auth.register.title')}
                        </h1>
                        <p className="mt-3 font-body text-base text-[var(--ink-light)]">
                            {t('auth.register.subtitle')}
                        </p>
                    </div>

                    <Form
                        action={store()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="email"
                                        className="font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)]"
                                    >
                                        {t('auth.register.email')}
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder={t('auth.register.email_placeholder')}
                                        className="input-sketch px-3 py-2 font-body text-base"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 font-body text-sm text-[var(--accent-frida)]">
                                            ▌ {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="password"
                                        className="font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)]"
                                    >
                                        {t('auth.register.password')}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="new-password"
                                        placeholder={t('auth.register.password_placeholder')}
                                        className="input-sketch px-3 py-2 font-body text-base"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 font-body text-sm text-[var(--accent-frida)]">
                                            ▌ {errors.password}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-sketch mt-2 px-4 py-3 disabled:opacity-50"
                                    style={{
                                        backgroundColor: 'var(--accent-dali)',
                                        color: 'var(--bg)',
                                    }}
                                >
                                    {processing ? t('auth.register.loading') : t('auth.register.create')}
                                </button>
                            </>
                        )}
                    </Form>

                    <p className="mt-8 text-center font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        {t('auth.register.have_account')}{' '}
                        <Link
                            href="/login"
                            className="text-[var(--ink)] underline-offset-2 hover:underline"
                        >
                            {t('auth.register.log_in')}
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
