Pod::Spec.new do |s|
  s.name           = 'ThermalState'
  s.version        = '1.0.0'
  s.summary        = 'Reports ProcessInfo.thermalState to JavaScript.'
  s.description    = 'Local Expo module for Cue Cam: the device thermal state and its changes.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = "**/*.{h,m,mm,swift}"
end
