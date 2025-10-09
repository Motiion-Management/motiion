const prefixes = ['https://motiion.io', 'motiion://', 'motiion-dev://']

const linking = {
  prefixes,
  config: {
    screens: {
      app: {
        path: 'app',
        screens: {
          onboarding: {
            path: 'onboarding',
            screens: {
              complete: 'complete',
              '[group]': {
                path: ':group',
                screens: {
                  '[step]': ':step',
                },
              },
              profile: {
                path: 'profile',
                screens: {
                  resume: 'resume',
                },
              },
              review: {
                path: 'review',
                screens: {
                  index: '',
                  general: 'general',
                  experiences: 'experiences',
                  experience: {
                    path: 'experience',
                    screens: {
                      '[id]': ':id',
                    },
                  },
                  training: {
                    path: 'training',
                    screens: {
                      '[id]': ':id',
                    },
                  },
                },
              },
              experiences: {
                path: 'experiences',
                screens: {
                  projects: 'projects',
                },
              },
            },
          },
          '(modals)': {
            path: '',
            screens: {
              onboarding: {
                path: 'onboarding',
                screens: {
                  review: {
                    path: 'review',
                    screens: {
                      '[step]': ':step',
                      experience: {
                        path: 'experience',
                        screens: {
                          '[id]': ':id',
                        },
                      },
                      training: {
                        path: 'training',
                        screens: {
                          '[id]': ':id',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const

export default linking
